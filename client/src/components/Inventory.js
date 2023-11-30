import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import eventEmitter from './EventEmitter';

const Inventory = ({ characterId, closeModal }) => {
    const [playerData, setPlayerData] = useState({
        inventory: [],
        equippedItems: {
            meleeWeapon: null,
            rangedWeapon: null,
            armor: null,
            ring: null,
            necklace: null
        },
        stats: {
            strength: 0,
            vitality: 0,
            armor: 0,
            luck: 0,
            dexterity: 0,
            speed: 0,
            max_hp: 0,
            current_hp: 0,
            level: 0,
            exp: 0,
            required_exp: 0,
            gold: 0
        }
    });
    const [filter, setFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(true);

    const fetchPlayerData = useCallback(async () => {
        try {
            const response = await axios.get(`/player_data`);
            const responseData = response.data;
            const { inventory, ...stats } = responseData;

            setPlayerData({
                inventory: inventory || [],
                equippedItems: {
                    meleeWeapon: responseData.equipped_melee_weapon,
                    rangedWeapon: responseData.equipped_ranged_weapon,
                    armor: responseData.equipped_armor,
                    ring: responseData.equipped_ring,
                    necklace: responseData.equipped_necklace
                },
                stats: stats
            });
    
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching player data:', error);
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlayerData();
    }, [fetchPlayerData]);

    const handleChangeEquipment = async (itemId) => {
        try {
            await axios.post(`/character/${characterId}/change_equipment`, { item_id: itemId });
            await fetchPlayerData();
        } catch (error) {
            console.error('Error changing equipment:', error);
        }
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
    };

    const isEquippable = (itemType) => {
        return itemType !== 'Consumable' && itemType !== 'Monster Drop';
    };

    const handleUseConsumable = async (itemId) => {
        try {
            await axios.post(`/character/${characterId}/use_consumable`, { itemId });
            alert('Consumable used successfully');
            fetchPlayerData();
            eventEmitter.emit('playerDataChanged');
        } catch (error) {
            console.error('Error using consumable:', error);
        }
    };

    const isConsumable = (itemType) => {
        return itemType === 'Consumable';
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

    const filteredInventory = playerData.inventory
        .filter(item => !isEquipped(item))
        .filter(item => {
            if (filter === 'All') return true;
            if (filter === 'Equipment') return isEquippable(item.type);
            return item.type === filter;
        });

    return (
        <div>
            <h3>Inventory</h3>
            <div>
                <button onClick={() => handleFilterChange('All')}>All</button>
                <button onClick={() => handleFilterChange('Monster Drop')}>Monster Drops</button>
                <button onClick={() => handleFilterChange('Consumable')}>Consumables</button>
                <button onClick={() => handleFilterChange('Equipment')}>Equipment</button>
            </div>
            <ul>
                {filteredInventory.map((inventoryItem, index) => (
                    <li key={index}>
                        {inventoryItem.name} - Quantity: {inventoryItem.quantity}
                        {isEquippable(inventoryItem.type) && (
                            <button onClick={() => handleChangeEquipment(inventoryItem.id)}>Equip</button>
                        )}
                        {isConsumable(inventoryItem.type) && (
                            <button onClick={() => handleUseConsumable(inventoryItem.id)}>Use</button>
                        )}
                    </li>
                ))}
            </ul>
            <h3>Equipped Items</h3>
            <div>
                <p>Melee Weapon: {playerData.equippedItems?.meleeWeapon?.name || 'None'}</p>
                <p>Ranged Weapon: {playerData.equippedItems?.rangedWeapon?.name || 'None'}</p>
                <p>Armor: {playerData.equippedItems?.armor?.name || 'None'}</p>
                <p>Ring: {playerData.equippedItems?.ring?.name || 'None'}</p>
                <p>Necklace: {playerData.equippedItems?.necklace?.name || 'None'}</p>
            </div>
            <h3>Player Stats</h3>
            <div>
                {isLoading ? (
                    <p>Loading player data...</p>
                ) : (
                    <>
                        <p>Strength: {playerData.stats?.strength || 0}</p>
                        <p>Vitality: {playerData.stats?.vitality || 0}</p>
                        <p>Armor: {playerData.stats?.armor || 0}</p>
                        <p>Luck: {playerData.stats?.luck || 0}</p>
                        <p>Dexterity: {playerData.stats?.dexterity || 0}</p>
                        <p>Speed: {playerData.stats?.speed || 0}</p>
                        <p>HP: {playerData.stats?.current_hp || 0} / {playerData.stats?.max_hp || 0}</p>
                        <p>Level: {playerData.stats?.level || 0}</p>
                        <p>XP: {playerData.stats?.exp || 0} / {playerData.stats?.required_exp || 0}</p>
                        <p>Gold: {playerData.stats?.gold || 0}</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default Inventory;