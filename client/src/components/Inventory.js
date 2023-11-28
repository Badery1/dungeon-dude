import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Inventory = ({ characterId, closeModal }) => {
    const [inventory, setInventory] = useState([]);
    const [equippedItems, setEquippedItems] = useState({
        meleeWeapon: null,
        rangedWeapon: null,
        armor: null,
        ring: null,
        necklace: null
    });

    const fetchInventory = useCallback(async () => {
        try {
            const response = await axios.get(`/character/${characterId}/inventory`);
            setInventory(response.data.inventory);
            setEquippedItems(response.data.equippedItems);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        }
    }, [characterId]);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    const handleChangeEquipment = async (itemId) => {
        try {
            await axios.post(`/character/${characterId}/change_equipment`, { itemId });
            fetchInventory();
        } catch (error) {
            console.error('Error changing equipment:', error);
        }
    };

    return (
        <div>
            <h3>Inventory</h3>
            <ul>
                {inventory.map(item => (
                    <li key={item.id}>
                        {item.name}
                        {item.type !== 'Consumable' && (
                            <button onClick={() => handleChangeEquipment(item.id)}>Equip</button>
                        )}
                    </li>
                ))}
            </ul>
            <h3>Equipped Items</h3>
            <div>
                <p>Melee Weapon: {equippedItems.meleeWeapon?.name || 'None'}</p>
                <p>Ranged Weapon: {equippedItems.rangedWeapon?.name || 'None'}</p>
                <p>Armor: {equippedItems.armor?.name || 'None'}</p>
                <p>Ring: {equippedItems.ring?.name || 'None'}</p>
                <p>Necklace: {equippedItems.necklace?.name || 'None'}</p>
            </div>
        </div>
    );
};

export default Inventory;