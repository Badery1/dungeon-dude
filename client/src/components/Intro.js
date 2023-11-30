import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Intro = () => {
    const navigate = useNavigate();
    const [currentStage, setCurrentStage] = useState(0);
    const [showStartButton, setShowStartButton] = useState(false);

    const storyText = [
        "Legends tell of a Dude, a legendary Dude born once every thousand years who has the strength to fight some slimes and stuff...",
        "You have been born into a crappy town living in an equally crappy house near a crappy dungeon...",
        "One day you decide to go in or something only to find out that you.. in fact... are the Dungeon Dude!",
        "Can you be the first Dungeon Dude who can defeat the legendary boss on the 100th floor???",
        "In this game, you can level up by fighting monsters in the dungeon, or by completing quests in town. Keep upgrading your equipment, and try to defeat the boss on the 100th floor of the dungeon!"
    ];

    useEffect(() => {
        if (currentStage < storyText.length) {
            const timer = setTimeout(() => {
                setCurrentStage(currentStage + 1);
            }, 3000);
            return () => clearTimeout(timer);
        } else if (!showStartButton) {
            const buttonTimer = setTimeout(() => {
                setShowStartButton(true);
            }, 7000);
            return () => clearTimeout(buttonTimer);
        }
    }, [currentStage, showStartButton, storyText.length]);

    const handleStartGame = async () => {
        try {
            const response = await axios.post(`/character_seen_intro`);
            console.log(response.data.message);
            navigate('/home');
        } catch (error) {
            console.error('Error updating intro status:', error);
        }
    };

    return (
        <div className="intro-container">
            <h1>Welcome To Dungeon Dude</h1>
            {storyText.slice(0, currentStage).map((line, index) => (
                <p key={index} className="intro-line" style={{ animationDelay: `${index * 2}s` }}>{line}</p>
            ))}
            {showStartButton && (
                <button onClick={handleStartGame} className="intro-button">Start Game</button>
            )}
        </div>
    );
};

export default Intro;