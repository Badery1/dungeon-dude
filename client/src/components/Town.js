import React from 'react';
import { useNavigate } from 'react-router-dom';

const Town = () => {
    const navigate = useNavigate();

    return (
        <div className="town-container">
            <h1>Welcome to Dungydale</h1>
            <button onClick={() => navigate('/town/guildhall')}>Guild Hall</button>
            <button onClick={() => navigate('/town/tavern')}>Tavern</button>
            <button onClick={() => navigate('/town/potion-shop')}>Potion Shop</button>
            <button onClick={() => navigate('/town/blacksmith')}>Blacksmith</button>
        </div>
    );
};

export default Town;
