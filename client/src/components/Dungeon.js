import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dungeon = ({ characterId, enterCombat, exitCombat }) => {
    const [highestAccessibleFloor, setHighestAccessibleFloor] = useState(1);
    const [showFloorMenu, setShowFloorMenu] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlayerData = async () => {
            try {
                const response = await axios.get('/player_data');
                const highestLevel = response.data.highest_dungeon_level || 1;
                setHighestAccessibleFloor(Math.min(highestLevel, 100));
            } catch (error) {
                console.error('Error fetching player data:', error);
            }
        };

        fetchPlayerData();
    }, []);

    const handleFloorSelect = async (floorNumber) => {
        try {
            await axios.post('/dungeon/choose_floor', { floor: floorNumber });
            navigate('/combat', { state: { floor: floorNumber } });
        } catch (error) {
            console.error('Error initiating combat:', error);
        }
    };

    const toggleFloorMenu = () => {
        setShowFloorMenu(!showFloorMenu);
    };

    return (
        <div>
            <h1>Dungeon</h1>
            <button onClick={toggleFloorMenu}>
                {showFloorMenu ? 'Hide Floors' : 'Select Floor'}
            </button>

            {showFloorMenu && (
                <div>
                    <p>Choose a Floor:</p>
                    {[...Array(highestAccessibleFloor)].map((_, index) => (
                        <button 
                            key={index + 1} 
                            onClick={() => handleFloorSelect(index + 1)}
                        >
                            Floor {index + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dungeon;