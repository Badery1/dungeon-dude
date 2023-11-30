import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import eventEmitter from './EventEmitter';

const GuildHall = () => {
    const [sellableItems, setSellableItems] = useState([]);
    const [showGuildMasterDialogue, setShowGuildMasterDialogue] = useState(false);
    const navigate = useNavigate();

    const handleGuildMasterClick = () => {
        setShowGuildMasterDialogue(!showGuildMasterDialogue);
        if (!showGuildMasterDialogue) {
            fetchSellableItems();
        }
    };

    const fetchSellableItems = async () => {
        try {
            const response = await axios.get('/player_data');
            const monsterDrops = response.data.inventory.filter(item => item.type === 'Monster Drop');
            setSellableItems(monsterDrops);
        } catch (error) {
            console.error('Error fetching sellable items:', error);
        }
    };

    const handleSellItem = async (itemId, quantity) => {
        try {
            const response = await axios.post(`/sell_monster_component/${itemId}`, { quantity });
            alert(response.data.message);
            eventEmitter.emit('playerDataChanged');
            fetchSellableItems();
        } catch (error) {
            console.error('Error selling item:', error);
        }
    };

    const handleBackToTown = () => {
        navigate('/town');
    };

    return (
        <div className="guildhall-container">
            <h1>Guild Hall</h1>
            <button onClick={handleBackToTown}>Back to Town</button>
            <button onClick={handleGuildMasterClick}>Talk to Guild Master</button>

            {showGuildMasterDialogue && (
                <div className="guildhall-dialogue">
                    <p>Welcome to the Guild Hall! Do you have any monster components to sell?</p>
                    {sellableItems.length > 0 ? (
                        <div className="guildhall-items">
                            <ul>
                                {sellableItems.map(item => (
                                    <li key={item.id}>
                                        {item.name} - {item.price}
                                        <button onClick={() => handleSellItem(item.id, item.quantity)}>Sell All</button>
                                        <button onClick={() => handleSellItem(item.id, 1)}>Sell One</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p>No monster components to sell.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default GuildHall;