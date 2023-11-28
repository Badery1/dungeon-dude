import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CharacterSelection = ({ onSelectCharacter }) => {
    const [characters, setCharacters] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCharacters();
    }, []);

    const fetchCharacters = async () => {
        try {
            const response = await axios.get('/characters');
            setCharacters(response.data);
        } catch (error) {
            console.error('Error fetching characters', error);
        }
    };

    const handleCharacterSelect = async (character) => {
        try {
            await axios.post(`/select_character/${character.id}`);
            onSelectCharacter(character.id);
    
            if (!character.has_seen_intro) {
                navigate(`/intro`);
            } else {
                navigate('/home');
            }
        } catch (error) {
            console.error('Error selecting character:', error);
        }
    };

    const handleUpdateCharacter = async (characterId, newName) => {
        try {
            await axios.patch(`/update_character/${characterId}`, { name: newName });
            fetchCharacters();
        } catch (error) {
            console.error('Error updating character', error);
        }
    };

    const handleDeleteCharacter = async (characterId) => {
        if (window.confirm("Are you sure you want to delete this character?")) {
            try {
                await axios.delete(`/delete_character/${characterId}`);
                fetchCharacters();
            } catch (error) {
                console.error('Error deleting character', error);
            }
        }
    };

    return (
        <div>
            <h1>Select Your Character</h1>
            {characters.map((character) => (
                <div key={character.id}>
                    <h2 onClick={() => handleCharacterSelect(character)}>{character.name}</h2>
                    <input 
                        type="text" 
                        defaultValue={character.name} 
                        onBlur={(e) => handleUpdateCharacter(character.id, e.target.value)}
                    />
                    <button onClick={() => handleDeleteCharacter(character.id)}>Delete</button>
                </div>
            ))}
            <button onClick={() => navigate('/character-creation')}>Create New Character</button>
        </div>
    );
};

export default CharacterSelection;