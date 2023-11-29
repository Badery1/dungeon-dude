import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
            setCombatLog([...combatLog, response.data.outcome]);
    
            if (response.data.updatedMonsterHp !== undefined) {
                setMonster(prevMonster => ({ ...prevMonster, current_hp: response.data.updatedMonsterHp }));
            }

            if (!response.data.outcome.includes('Monster defeated')) {
                setCurrentTurn('monster');
                setTimeout(() => {
                    handleMonsterAction();
                }, 1000);
            } else {
                handleEndCombat();
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

            setCombatLog([...combatLog, response.data.outcome]);

            if (response.data.characterDefeated) {
                navigate('/game-over');
            } else {
                setCurrentTurn(response.data.nextTurn);
            }
        } catch (error) {
            console.error('Error during monster action:', error);
        }
    };

    const handleEndCombat = async () => {
        try {
            const response = await axios.post('/end_combat');
            const data = response.data;
    
            setCombatLog([...combatLog, data.message]);
    
            if (data.level_up) {
                setCombatLog(log => [...log, `You leveled up to level ${data.level_up.new_level}`]);
            }
    
            if (data.loot) {
                data.loot.forEach(item => {
                    setCombatLog(log => [...log, `You found ${item}`]);
                });
            }
    
            if (data.quest_progress) {
                setCombatLog(log => [...log, 'Quest progress updated']);
            }
    
            if (data.new_dungeon_level) {
                setCombatLog(log => [...log, `You can now access dungeon level ${data.new_dungeon_level}`]);
            }
    
            setCombatEnded(true);
            exitCombat();
    
        } catch (error) {
            console.error('Error during end combat:', error);
        }
    };
    

    const handleNextFloor = async () => {
        try {
            const response = await axios.post('/next_floor');
            const newMonster = response.data.monster;

            setMonster(newMonster);
            setCombatLog([]);

        } catch (error) {
            console.error('Error moving to next floor:', error);
        }
    };

    const handleRepeatFloor = async () => {
        try {
            await axios.post('/reset_current_floor', { characterId });
            fetchCurrentMonster();
        } catch (error) {
            console.error('Error resetting current floor:', error);
        }
    };

    const handleReturnToDungeonEntrance = () => {
        navigate('/dungeon');
    };

    return (
        <div>
            <h2>Combat!</h2>
            {monster && <p>Monster: {monster.name} - HP: {monster.current_hp}</p>}
            <div>
                <button onClick={() => handlePlayerAction('Attack Melee')}>Melee Attack</button>
                <button onClick={() => handlePlayerAction('Attack Ranged')}>Ranged Attack</button>
                <button onClick={() => handlePlayerAction('Flee')}>Flee</button>
            </div>
            <div>
                <h3>Combat Log</h3>
                {combatLog.map((log, index) => <p key={index}>{log}</p>)}
            </div>
    
            {combatEnded && (
                <div>
                    {monster.level < 100 && (
                        <button onClick={handleNextFloor}>Next Floor</button>
                    )}
                    <button onClick={handleRepeatFloor}>Repeat Floor</button>
                    <button onClick={handleReturnToDungeonEntrance}>Return to Dungeon Entrance</button>
                </div>
            )}
        </div>
    );
};

export default Combat;