import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import eventEmitter from './EventEmitter';

const PotionShop = () => {
    const [itemsForSale, setItemsForSale] = useState([]);
    const [showDialogue, setShowDialogue] = useState(false);
    const [showItems, setShowItems] = useState(false);
    const navigate = useNavigate();

    const POTION_SHOP_NPC_ID = 4;

    useEffect(() => {
        fetchItemsForSale();
    }, []);

    const fetchItemsForSale = async () => {
        try {
            const response = await axios.get(`/npc/${POTION_SHOP_NPC_ID}/interact`);
            if (response.data.items_for_sale) {
                setItemsForSale(response.data.items_for_sale);
            }
        } catch (error) {
            console.error('Error fetching items for sale:', error);
        }
    };

    const handleBuyItem = async (itemId) => {
        try {
            const response = await axios.post(`/buy_item/${POTION_SHOP_NPC_ID}/${itemId}`);
            alert(response.data.message);
            eventEmitter.emit('playerDataChanged');
            fetchItemsForSale();
        } catch (error) {
            console.error('Error buying item:', error);
        }
    };

    const handleNPCClick = async () => {
        if (!showDialogue) {
            try {
                const response = await axios.get(`/npc/${POTION_SHOP_NPC_ID}/interact`);
                if (response.data.items_for_sale) {
                    setItemsForSale(response.data.items_for_sale);
                }
            } catch (error) {
                console.error('Error fetching items for sale:', error);
            }
        }
        setShowDialogue(!showDialogue);
    };

    const handleBackToTown = () => {
        navigate('/town');
    };

    const handleViewItems = () => {
        setShowItems(!showItems);
    };

    return (
        <div className="potion-shop-container">
            <h1>Potion Shop</h1>
            <button onClick={handleBackToTown}>Back to Town</button>
            <button onClick={handleNPCClick}>Talk to Potion Seller</button>

            {showDialogue && (
                <div className="potion-shop-dialogue">
                    <p>Welcome to the Potion Shop! What do you need?</p>
                    <button onClick={handleViewItems}>View Items</button>
                </div>
            )}

            {showItems && (
                <div className="potion-shop-items">
                    <ul>
                        {itemsForSale.map(item => (
                            <li key={item.id}>
                                {item.name} - {item.price} Gold
                                <button onClick={() => handleBuyItem(item.id)}>Buy</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default PotionShop;
