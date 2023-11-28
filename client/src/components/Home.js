import React, { useState } from 'react';
import axios from 'axios';

const Home = () => {
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);

    const displayFeedback = (message) => {
        setFeedbackMessage(message);
        setIsFeedbackVisible(true);
        setTimeout(() => setIsFeedbackVisible(false), 3000);
    };

    const handleSaveGame = async () => {
        try {
            const response = await axios.post(`/save_game`);
            displayFeedback(response.data.message);
        } catch (error) {
            console.error('Error saving game:', error);
            displayFeedback('Error saving game. Please try again.');
        }
    };

    const handleRest = async () => {
        try {
            const response = await axios.post(`/rest`);
            displayFeedback(response.data.message);
        } catch (error) {
            console.error('Error resting:', error);
            displayFeedback('Error resting. Please try again.');
        }
    };

    return (
        <div>
            <h1>Welcome Home</h1>
            <button onClick={handleSaveGame}>Save Game</button>
            <button onClick={handleRest}>Rest and Heal</button>
            {isFeedbackVisible && <p>{feedbackMessage}</p>}
        </div>
    );
};

export default Home;
