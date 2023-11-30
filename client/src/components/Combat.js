import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import eventEmitter from './EventEmitter';

const Combat = ({ characterId, enterCombat, exitCombat }) => {
    const [monster, setMonster] = useState(null);
    const [combatEnded, setCombatEnded] = useState(false);
    const [combatLog, setCombatLog] = useState([]);
    const navigate = useNavigate();

    const [currentTurn, setCurrentTurn] = useState('player');

    const fetchCurrentMonster = async () => {
        try {
            const response = await axios.get('/current_monster');
            setMonster(response.data);
        } catch (error) {
            console.error('Error fetching current monster:', error);
        }
    };

    const isPlayersTurn = currentTurn === 'player';

    useEffect(() => {
        initiateCombat();
        enterCombat();
        fetchCurrentMonster();
    }, []);

    const initiateCombat = async () => {
        try {
            await axios.post('/initiate_combat');
        } catch (error) {
            console.error('Error initiating combat:', error);
        }
    };

    const handlePlayerAction = async (actionType, itemId = null) => {
        try {
            const response = await axios.post('/player_combat_action', {
                action: actionType,
                itemId
            });
    
            setCombatLog(prevLog => {
                const newLog = [response.data.outcome, ...prevLog];
                return newLog.slice(0, 12);
            });
    
            if (response.data.updatedMonsterHp !== undefined) {
                setMonster(prevMonster => ({
                    ...prevMonster,
                    current_hp: response.data.updatedMonsterHp
                }));
            }
    
            if (actionType === 'Flee' && response.data.outcome.includes('Successfully fled from combat')) {
                exitCombat();
                navigate('/dungeon');
            } else if (response.data.outcome.includes('Monster defeated')) {
                handleEndCombat();
            } else {
                setCurrentTurn('monster');
                setTimeout(() => {
                    handleMonsterAction();
                }, 1000);
            }
        } catch (error) {
            console.error('Error during player action:', error);
        }
    };

    const handleMonsterAction = async () => {
        try {
            const payload = {
                character_id: characterId,
                monster_id: monster.id,
                turn: 'Monster'
            };

            const response = await axios.post('/monster_combat_action', payload);

            setCombatLog(prevLog => {
                const newLog = [response.data.outcome, ...prevLog];
                return newLog.slice(0, 12);
            });

            if (response.data.characterDefeated) {
                navigate('/game-over');
            } else {
                setCurrentTurn('player');
                eventEmitter.emit('playerDataChanged');
            }
        } catch (error) {
            console.error('Error during monster action:', error);
        }
    };

    const handleEndCombat = async () => {
        try {
            const response = await axios.post('/end_combat');
            const data = response.data;

            let newLogMessages = [];

            if (data.level_up) {
                newLogMessages.push(`You leveled up to level ${data.level_up.new_level}`);
            }
            if (data.loot) {
                newLogMessages.push(...data.loot.map(item => `You found ${item}`));
            }
            if (data.quest_progress) {
                newLogMessages.push('Quest progress updated');
            }
            if (data.new_dungeon_level) {
                newLogMessages.push(`You can now access dungeon level ${data.new_dungeon_level}`);
            }

            setCombatLog(prevLog => {
                const updatedLog = [...newLogMessages, ...prevLog];
                return updatedLog.slice(0, 12);
            });
    
            setCombatEnded(true);
            eventEmitter.emit('playerDataChanged');
            exitCombat();
        } catch (error) {
            console.error('Error during end combat:', error);
        }
    };

    const handleNextFloor = async () => {
        try {
            const response = await axios.post('/next_floor', { characterId });
            if (response.status === 200) {
                setCombatEnded(false);
                setCombatLog([]);

                fetchCurrentMonster();
                enterCombat();
            } else {
                console.error('Unexpected response status:', response.status);
            }
        } catch (error) {
            console.error('Error resetting current floor:', error);
        }
    };

    const handleRepeatFloor = async () => {
        try {
            const response = await axios.post('/reset_current_floor', { characterId });
            if (response.status === 200) {
                setCombatEnded(false);
                setCombatLog([]);

                fetchCurrentMonster();
                enterCombat();
            } else {
                console.error('Unexpected response status:', response.status);
            }
        } catch (error) {
            console.error('Error resetting current floor:', error);
        }
    };

    const handleReturnToDungeonEntrance = () => {
        exitCombat();
        navigate('/dungeon');
    };

    return (
        <div className="combat-container">
            {monster && (
                <div className="combat-header">
                    <h2>Floor {monster.level} Combat</h2>
                    <div className="monster-info">
                        <p>{monster.name} - HP: {monster.current_hp} / {monster.max_hp}</p>
                    </div>
                </div>
            )}

            {combatEnded && monster && (
                <div className="combat-options">
                    {monster.level < 100 && (
                        <button onClick={handleNextFloor}>Next Floor</button>
                    )}
                    <button onClick={handleRepeatFloor}>Repeat Floor</button>
                    <button onClick={handleReturnToDungeonEntrance}>Return to Dungeon Entrance</button>
                </div>
            )}

            {!combatEnded && (
                <div className="combat-options">
                    <button onClick={() => handlePlayerAction('Attack Melee')} disabled={!isPlayersTurn}>Melee Attack</button>
                    <button onClick={() => handlePlayerAction('Attack Ranged')} disabled={!isPlayersTurn}>Ranged Attack</button>
                    <button onClick={() => handlePlayerAction('Flee')} disabled={!isPlayersTurn}>Flee</button>
                </div>
            )}

            <div className="combat-log">
                <h3>Combat Log</h3>
                {combatLog.map((log, index) => <p key={index}>{log}</p>)}
            </div>
        </div>
    );
};

export default Combat;