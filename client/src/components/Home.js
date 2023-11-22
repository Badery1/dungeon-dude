import React from 'react';

const Home = ({ onRest, onSaveGame }) => {
    return (
        <div>
            <h2>Your Home</h2>
            <button onClick={onRest}>Rest</button>
            <button onClick={onSaveGame}>Save Game</button>
        </div>
    );
};

export default Home;