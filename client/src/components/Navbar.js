import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ onLogout, isCharacterSelected, isInCombat }) => {
    return (
        <nav>
            <ul>
                {isCharacterSelected && !isInCombat && (
                    <>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/town">Town</Link></li>
                        <li><Link to="/dungeon">Dungeon</Link></li>
                    </>
                )}
                {!isInCombat && (
                    <li><Link to="/character-selection">Character Selection</Link></li>
                )}
                <li><button onClick={onLogout}>Logout</button></li>
                <li><Link to="/account-settings">Account Settings</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;