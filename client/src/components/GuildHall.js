import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GuildHall = () => {
    const [sellableItems, setSellableItems] = useState([]);
    const [showGuildMasterDialogue, setShowGuildMasterDialogue] = useState(false);
    const [showItems, setShowItems] = useState(false);
    const navigate = useNavigate();

    const handleGuildMasterClick = () => {
        setShowGuildMasterDialogue(!showGuildMasterDialogue);
        setShowItems(false);
    };

    const handleViewItems = async () => {
        try {
            const response = await axios.get(`/npc/1/interact`);
            if (response.data.sellable_items) {
                setSellableItems(response.data.sellable_items);
                setShowItems(true);
            }
        } catch (error) {
            console.error('Error fetching sellable items:', error);
        }
    };

    const handleSellItem = async (itemId) => {
        try {
            const response = await axios.post(`/sell_item/${itemId}`);
            alert(response.data.message);
            handleViewItems();
        } catch (error) {
            console.error('Error selling item:', error);
        }
    };

    const handleBackToTown = () => {
        navigate('/town');
    };

    return (
        <div>
            <h1>Guild Hall</h1>
            <button onClick={handleBackToTown}>Back to Town</button>
            <button onClick={handleGuildMasterClick}>Talk to Guild Master</button>

            {showGuildMasterDialogue && (
                <div>
                    <p>Welcome to the Guild Hall! Do you have any monster components to sell?</p>
                    <button onClick={handleViewItems}>View Sellable Items</button>
                </div>
            )}

            {showItems && (
                <ul>
                    {sellableItems.map(item => (
                        <li key={item.id}>
                            {item.name} - {item.price} Gold
                            <button onClick={() => handleSellItem(item.id)}>Sell</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default GuildHall;