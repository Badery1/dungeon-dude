import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ onLogout, isCharacterSelected, isInCombat }) => {
    const location = useLocation();

    const isCurrentRoute = (route) => {
        return location.pathname === route;
    };

    return (
        <nav>
            <ul>
                {isCharacterSelected && !isInCombat && (
                    <>
                        {!isCurrentRoute('/home') && <li><Link to="/home">Home</Link></li>}
                        {!isCurrentRoute('/town') && <li><Link to="/town">Town</Link></li>}
                        {!isCurrentRoute('/dungeon') && <li><Link to="/dungeon">Dungeon</Link></li>}
                    </>
                )}
                {!isInCombat && !isCurrentRoute('/character-selection') && (
                    <li><Link to="/character-selection">Character Selection</Link></li>
                )}
                <li><button onClick={onLogout}>Logout</button></li>
                {!isCurrentRoute('/account-settings') && <li><Link to="/account-settings">Account Settings</Link></li>}
            </ul>
        </nav>
    );
};

export default Navbar;
