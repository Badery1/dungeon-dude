import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';
import Inventory from './Inventory';
import eventEmitter from './EventEmitter';

const PlayerInfo = ({ characterId }) => {
    const [playerData, setPlayerData] = useState({
        gold: 0,
        level: 0,
        current_hp: 0,
        max_hp: 0
    });
    const [showInventoryModal, setShowInventoryModal] = useState(false);

    useEffect(() => {
        const fetchPlayerData = async () => {
            try {
                const response = await axios.get('/player_data'); 
                setPlayerData(response.data);
            } catch (error) {
                console.error('Error fetching player data:', error);
            }
        };

        const updatePlayerInfo = () => fetchPlayerData();

        eventEmitter.subscribe('playerDataChanged', updatePlayerInfo);

        fetchPlayerData();

        return () => {
            eventEmitter.unsubscribe('playerDataChanged', updatePlayerInfo);
        };
    }, []);

    const handleInventoryClick = () => {
        setShowInventoryModal(true);
    };

    const handleQuestsClick = () => {
        // Navigate to quests page or handle quests view
    };

    return (
        <div>
            <h3>Player Info</h3>
            <p>Gold: {playerData.gold}</p>
            <p>Level: {playerData.level}</p>
            <p>HP: {playerData.current_hp} / {playerData.max_hp}</p>
            <button onClick={handleInventoryClick}>Inventory</button>
            <button onClick={handleQuestsClick}>Quests</button>

            {showInventoryModal && (
                <Modal onClose={() => setShowInventoryModal(false)}>
                    <Inventory characterId={characterId} closeModal={() => setShowInventoryModal(false)} />
                </Modal>
            )}
        </div>
    );
};

export default PlayerInfo;