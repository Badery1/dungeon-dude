import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import eventEmitter from './EventEmitter';

const Blacksmith = () => {
    const [itemsForSale, setItemsForSale] = useState([]);
    const [playerData, setPlayerData] = useState({
        inventory: [],
        equippedItems: {}
    });
    const [showDialogue, setShowDialogue] = useState(false);
    const [showItems, setShowItems] = useState(false);
    const [showSellMenu, setShowSellMenu] = useState(false);
    const navigate = useNavigate();

    const BLACKSMITH_NPC_ID = 5;

    useEffect(() => {
        fetchItemsForSale();
        fetchPlayerData();
    }, []);

    const fetchPlayerData = async () => {
        try {
            const response = await axios.get(`/player_data`);
            setPlayerData(response.data);
        } catch (error) {
            console.error('Error fetching player data:', error);
        }
    };

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

    const handleBackToTown = () => {
        navigate('/town');
    };

    const isEquippable = (itemType) => {
        return itemType !== 'Consumable' && itemType !== 'Monster Drop';
    };

    const isEquipped = (item) => {
        const equippedItems = playerData.equippedItems || {};
        return [
            equippedItems.meleeWeapon,
            equippedItems.rangedWeapon,
            equippedItems.armor,
            equippedItems.ring,
            equippedItems.necklace
        ].some(equippedItem => equippedItem && equippedItem.id === item.id);
    };

    const sellableItems = playerData.inventory
        .filter(item => isEquippable(item.type) && !isEquipped(item))
        .map(item => ({
            ...item,
            sellPrice: item.price
        }));

    const handleNPCClick = () => {
        setShowDialogue(!showDialogue);
        setShowItems(false);
        setShowSellMenu(false);
        if (!showDialogue) {
            fetchItemsForSale();
        }
    };

    const handleViewItems = () => {
        setShowItems(!showItems);
    };

    const handleSellMenu = () => {
        setShowSellMenu(!showSellMenu);
    };

    const handleBuyItem = async (itemId) => {
        try {
            const response = await axios.post(`/buy_item/${BLACKSMITH_NPC_ID}/${itemId}`);
            alert(response.data.message);
            fetchItemsForSale();
            eventEmitter.emit('playerDataChanged');
            fetchPlayerData();
        } catch (error) {
            console.error('Error buying item:', error.response?.data?.message || error.message);
        }
    };

    const handleSellItem = async (itemId) => {
        try {
            const response = await axios.post(`/sell_item/${itemId}`);
            alert(response.data.message);
            eventEmitter.emit('playerDataChanged');
            fetchPlayerData();
        } catch (error) {
            console.error('Error selling item:', error.response?.data?.message || error.message);
        }
    };

    return (
        <div className="blacksmith-container">
            <h1>Blacksmith</h1>
            <button onClick={handleBackToTown}>Back to Town</button>
            <button onClick={handleNPCClick}>Talk to Blacksmith</button>

            {showDialogue && (
                <div className="blacksmith-dialogue">
                    <p>Welcome to the Blacksmith! Looking for gear or want to sell something?</p>
                    <button onClick={handleViewItems}>View Items for Sale</button>
                    <button onClick={handleSellMenu}>Sell Items</button>
                </div>
            )}

            {showItems && (
                <div className="blacksmith-items">
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

            {showSellMenu && (
                <div className="blacksmith-items">
                    <ul>
                        {sellableItems.map(item => (
                            <li key={item.id}>
                                {item.name} - {item.sellPrice}
                                <button onClick={() => handleSellItem(item.id)}>Sell</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Blacksmith;