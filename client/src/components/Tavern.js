import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Tavern = () => {
    const [quests, setQuests] = useState([]);
    const [dialogue, setDialogue] = useState('');
    const [showQuests, setShowQuests] = useState(false);
    const [showDialogue, setShowDialogue] = useState(false);
    const [showQuestGiverDialogue, setShowQuestGiverDialogue] = useState(false);
    const navigate = useNavigate();

    const bartenderLines = [
        "Welcome to the tavern! What can I get for you?",
        "So I've heard your the legendary Dungeon Dude or something? Well good for you.",
        "Can I help you? Probably not, I'm literally just here to respond to you.",
        "You know, I used to be an adventurer like you... don't worry I won't say it.",
        "I've heard on the last floor of the dungeon something sinister stirs...",
        "Shouldn't you be killing stuff or something?",
        "You know, I though the Legendary Dungeon Dude would be... taller.",
        "Did you know that leveling from 99 to 100 takes well over 3,450,748,938 xp? That sounds like bad game design.",
        "You'd think I could sell you beer or something, but nope. Just chat from me!",
        "My dialogue is about as creative as some monster names... like... Hospital bill? Really?",
        "That will be 2gp...",
        "( ͡~ ͜ʖ ͡°)"
    ];

    const questGiverDialogue = "Hey there Dungeon Dude, I've got some quests I think you might be interested in...";

    const handleFetchQuests = async () => {
        try {
            const response = await axios.get(`/npc/2/interact`);
            setQuests(response.data.quests);
            setShowQuests(true);
        } catch (error) {
            console.error('Error fetching quests:', error);
        }
    };

    const handleInteractWithMercenary = async () => {
        try {
            const response = await axios.get(`/npc/2/interact`);
            setQuests(response.data.quests);
            setShowQuests(true);
            setShowQuestGiverDialogue(false);
        } catch (error) {
            console.error('Error interacting with mercenary:', error);
        }
    };

    const handleQuestGiverClick = () => {
        setShowQuestGiverDialogue(!showQuestGiverDialogue);
        setShowQuests(false);
    };

    const handleInteractWithBartender = () => {
        const randomIndex = Math.floor(Math.random() * bartenderLines.length);
        setDialogue(bartenderLines[randomIndex]);
        setShowDialogue(true);
        setTimeout(() => setShowDialogue(false), 5000);
    };

    const handleStartQuest = async (questId) => {
        try {
            await axios.post(`/start_quest/${questId}`);
            alert('Quest started!');
            handleInteractWithMercenary();
        } catch (error) {
            console.error('Error starting quest:', error);
        }
    };

    const handleAbandonQuest = async (questId) => {
        try {
            await axios.post(`/abandon_quest/${questId}`);
            alert('Quest abandoned!');
            handleInteractWithMercenary();
        } catch (error) {
            console.error('Error abandoning quest:', error);
        }
    };

    const handleCompleteQuest = async (questId) => {
        try {
            await axios.post(`/complete_quest/${questId}`);
            alert('Quest completed!');
            handleInteractWithMercenary();
        } catch (error) {
            console.error('Error completing quest:', error);
        }
    };

    const handleReturnToTown = () => {
        navigate('/town');
    };

    return (
        <div>
            <h1>Tavern</h1>
            <button onClick={handleQuestGiverClick}>Talk to Shady Mercenary</button>
            <button onClick={handleInteractWithBartender}>Talk to Bartender</button>
    
            {showQuestGiverDialogue && (
                <div>
                    <p>{questGiverDialogue}</p>
                    <button onClick={handleFetchQuests}>View Quests</button>
                </div>
            )}
    
            {showQuests && quests.map(quest => (
                <div key={quest.id}>
                    <h3>{quest.title}</h3>
                    <p>{quest.description}</p>
                    <p>Status: {quest.status}</p>
                    {quest.status === 'In Progress' && (
                        <>
                            <button onClick={() => handleCompleteQuest(quest.id)}>Complete Quest</button>
                            <button onClick={() => handleAbandonQuest(quest.id)}>Abandon Quest</button>
                        </>
                    )}
                    {quest.status === 'Not Started' && (
                        <button onClick={() => handleStartQuest(quest.id)}>Start Quest</button>
                    )}
                </div>
            ))}
    
            {showDialogue && (
                <p>{dialogue}</p>
            )}
    
            <button onClick={handleReturnToTown}>Return to Town</button>
        </div>
    );
};

export default Tavern;
