import React, { useState } from 'react';
import axios from 'axios';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import LoginRegister from './LoginRegister';
import CharacterCreation from './CharacterCreation';
import CharacterSelection from './CharacterSelection';
import AccountSettings from './AccountSettings';
import Intro from './Intro';
import Home from './Home';
import Town from './Town';
import GuildHall from './GuildHall';
import Tavern from './Tavern';

const ParentComponent = () => {
    const [isLoggedIn, setLoggedIn] = useState(false);
    const [selectedCharacterId, setSelectedCharacterId] = useState(null);
    const [isInCombat, setIsInCombat] = useState(false);

    const navigate = useNavigate();

    const handleLogin = () => {
        setLoggedIn(true);
    };

    const handleLogout = async () => {
        try {
            await axios.post('/logout');
            setLoggedIn(false);
            setSelectedCharacterId(null);
            setIsInCombat(false);
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const selectCharacter = async (characterId) => {
        try {
            await axios.post(`/select_character/${characterId}`);
            setSelectedCharacterId(characterId);
        } catch (error) {
            console.error('Error selecting character:', error);
        }
    };

    const enterCombat = () => {
        setIsInCombat(true);
    };

    const exitCombat = () => {
        setIsInCombat(false);
    };

    const location = useLocation();

    const shouldShowNavbar = isLoggedIn && location.pathname !== '/intro';

    return (
        <div>
            {shouldShowNavbar && (
                <Navbar 
                    onLogout={handleLogout}
                    isCharacterSelected={!!selectedCharacterId}
                    isInCombat={isInCombat}
                />
            )}

            <Routes>
                {isLoggedIn ? (
                    <>
                        <Route path="/character-creation" element={<CharacterCreation />} />
                        <Route 
                            path="/character-selection" 
                            element={<CharacterSelection onSelectCharacter={selectCharacter} />} 
                        />
                        <Route path="/account-settings" element={<AccountSettings />} />
                        <Route 
                            path="/intro" 
                            element={<Intro characterId={selectedCharacterId} />} 
                        />
                        <Route path="/home" element={<Home characterId={selectedCharacterId} />} />
                        <Route path="/town" element={<Town />} />
                        <Route path="/town/guildhall" element={<GuildHall characterId={selectedCharacterId} />} />
                        <Route path="/town/tavern" element={<Tavern characterId={selectedCharacterId} />} />
                        {/* Other routes for logged in users */}
                    </>
                ) : (
                    <Route path="/" element={<LoginRegister onLogin={handleLogin} />} />
                )}
            </Routes>
        </div>
    );
};

export default ParentComponent;
