import React, { useState } from 'react';
import axios from 'axios';
import { Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import LoginRegister from './LoginRegister';
import CharacterCreation from './CharacterCreation';
import CharacterSelection from './CharacterSelection';
import AccountSettings from './AccountSettings';

const ParentComponent = () => {
    const [isLoggedIn, setLoggedIn] = useState(false);
    const [isCharacterSelected, setIsCharacterSelected] = useState(false);
    const [isInCombat, setIsInCombat] = useState(false);

    const handleLogin = () => {
        setLoggedIn(true);
    };

    const handleLogout = async () => {
        try {
            await axios.post('/logout');
            setLoggedIn(false);
            setIsCharacterSelected(false);
            setIsInCombat(false);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const selectCharacter = (characterId) => {
        setIsCharacterSelected(true);
    };

    const enterCombat = () => {
        setIsInCombat(true);
    };

    const exitCombat = () => {
        setIsInCombat(false);
    };

    return (
        <div>
            {isLoggedIn ? (
                <>
                    <Navbar 
                        onLogout={handleLogout}
                        isCharacterSelected={isCharacterSelected}
                        isInCombat={isInCombat}
                    />
                    <Routes>
                        <Route path="/character-creation" element={<CharacterCreation />} />
                        <Route 
                            path="/character-selection" 
                            element={<CharacterSelection onSelectCharacter={selectCharacter} />} 
                        />
                        <Route path="/account-settings" element={<AccountSettings />} />
                    </Routes>
                </>
            ) : (
                <LoginRegister onLogin={handleLogin} />
            )}
        </div>
    );
};

export default ParentComponent;