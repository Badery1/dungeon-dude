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
import PotionShop from './PotionShop';
import Blacksmith from './Blacksmith';
import PlayerInfo from './PlayerInfo';
import Dungeon from './Dungeon';
import Combat from './Combat';

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

    const navigateToCharacterSelection = () => {
        setSelectedCharacterId(null);
        navigate('/character-selection');
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
    
    const exitCombat = async () => {
        try {
            await axios.post('/end_combat2');
            setIsInCombat(false);
        } catch (error) {
            console.error('Error exiting combat:', error);
        }
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
                    navigateToCharacterSelection={navigateToCharacterSelection}
                />
            )}
    
            {isLoggedIn && selectedCharacterId && <PlayerInfo characterId={selectedCharacterId} />}
    
            <Routes>
                {isLoggedIn ? (
                    <>
                        <Route path="/character-creation" element={<CharacterCreation />} />
                        <Route 
                            path="/character-selection" 
                            element={<CharacterSelection onSelectCharacter={selectCharacter} />} 
                        />
                        <Route path="/account-settings" element={<AccountSettings onLogout={handleLogout} />} />
                        <Route 
                            path="/intro" 
                            element={<Intro characterId={selectedCharacterId} />} 
                        />
                        <Route path="/home" element={<Home characterId={selectedCharacterId} />} />
                        <Route path="/town" element={<Town characterId={selectedCharacterId} />} />
                        <Route path="/town/guildhall" element={<GuildHall characterId={selectedCharacterId} />} />
                        <Route path="/town/tavern" element={<Tavern characterId={selectedCharacterId} />} />
                        <Route path="/town/potion-shop" element={<PotionShop characterId={selectedCharacterId} />} />
                        <Route path="/town/blacksmith" element={<Blacksmith characterId={selectedCharacterId} />} />
                        <Route path="/dungeon" element={<Dungeon characterId={selectedCharacterId} enterCombat={enterCombat} exitCombat={exitCombat}/>} />
                        <Route path="/combat" element={<Combat characterId={selectedCharacterId} enterCombat={enterCombat} exitCombat={exitCombat}/>} />
                    </>
                ) : (
                    <Route path="/" element={<LoginRegister onLogin={handleLogin} />} />
                )}
            </Routes>
        </div>
    );
};

export default ParentComponent;
