import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Navbar = ({ onLogout, isCharacterSelected, isInCombat, navigateToCharacterSelection }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const isCurrentRoute = (route) => {
        return location.pathname === route;
    };

    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <nav>
            <ul>
                {isCharacterSelected && !isInCombat && (
                    <>
                        {!isCurrentRoute('/home') && <li><button onClick={() => handleNavigate('/home')}>Home</button></li>}
                        {!isCurrentRoute('/town') && <li><button onClick={() => handleNavigate('/town')}>Town</button></li>}
                        {!isCurrentRoute('/dungeon') && <li><button onClick={() => handleNavigate('/dungeon')}>Dungeon</button></li>}
                    </>
                )}
                {!isInCombat && !isCurrentRoute('/character-selection') && (
                    <li><button onClick={navigateToCharacterSelection}>Character Selection</button></li>
                )}
                <li><button onClick={onLogout}>Logout</button></li>
                {!isCurrentRoute('/account-settings') && <li><button onClick={() => handleNavigate('/account-settings')}>Account Settings</button></li>}
            </ul>
        </nav>
    );
};

export default Navbar;

