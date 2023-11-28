import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Blacksmith = () => {
    const [itemsForSale, setItemsForSale] = useState([]);
    const [showDialogue, setShowDialogue] = useState(false);
    const [showItems, setShowItems] = useState(false);
    const navigate = useNavigate();

    const BLACKSMITH_NPC_ID = 5;

    useEffect(() => {
        fetchItemsForSale();
    }, []);

    const fetchItemsForSale = async () => {
        try {
            const response = await axios.get(`/npc/${BLACKSMITH_NPC_ID}/interact`);
            if (response.data.items_for_sale) {
                setItemsForSale(response.data.items_for_sale);
            }
        } catch (error) {
            console.error('Error fetching items for sale:', error);
        }
    };

    const handleNPCClick = () => {
        setShowDialogue(!showDialogue);
        if (!showDialogue) {
            fetchItemsForSale();
        }
    };

    const handleViewItems = () => {
        setShowItems(!showItems);
    };

    const handleBuyItem = async (itemId) => {
        try {
            const response = await axios.post(`/buy_item/${BLACKSMITH_NPC_ID}/${itemId}`);
            alert(response.data.message);
            fetchItemsForSale();
        } catch (error) {
            console.error('Error buying item:', error);
        }
    };

    const handleBackToTown = () => {
        navigate('/town');
    };

    return (
        <div>
            <h1>Blacksmith</h1>
            <button onClick={handleBackToTown}>Back to Town</button>
            <button onClick={handleNPCClick}>Talk to Blacksmith</button>

            {showDialogue && (
                <>
                    <p>Welcome to the Blacksmith! Looking for gear?</p>
                    <button onClick={handleViewItems}>View Items</button>
                </>
            )}

            {showItems && (
                <ul>
                    {itemsForSale.map(item => (
                        <li key={item.id}>
                            {item.name} - {item.price} Gold
                            <button onClick={() => handleBuyItem(item.id)}>Buy</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Blacksmith;