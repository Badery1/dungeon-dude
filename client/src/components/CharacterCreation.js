import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CharacterCreation = ({ userId }) => {
    const [characterName, setCharacterName] = useState('');
    const navigate = useNavigate();

    const handleCharacterCreation = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/create_character', {
                name: characterName,
                user_id: userId
            });

            console.log('Character created:', response.data);
            navigate('/character-selection');
        } catch (error) {
            console.error('Error creating character', error);
        }
    };

    return (
        <div className="character-creation-container">
            <h1>Create New Character</h1>
            <form onSubmit={handleCharacterCreation} className="character-creation-form">
                <input 
                    type="text"
                    placeholder="Character Name"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                />
                <button type="submit">Create Character</button>
            </form>
        </div>
    );
};

export default CharacterCreation;