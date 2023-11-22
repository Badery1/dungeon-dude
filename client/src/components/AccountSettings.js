import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AccountSettings = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [currentUsername, setCurrentUsername] = useState('');

    useEffect(() => {
        const fetchCurrentUsername = async () => {
            try {
                const response = await axios.get('/current_user');
                setCurrentUsername(response.data.username);
            } catch (error) {
                console.error('Error fetching current username', error);
            }
        };

        fetchCurrentUsername();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.patch('/update_account', { username, password });
            alert('Account updated successfully');
            setPassword('');
            if (username) {
                setCurrentUsername(username);
                setUsername('');
            }
        } catch (error) {
            console.error('Update error:', error.response?.data);
        }
    };

    return (
        <div>
            <h2>Account Settings</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    placeholder={currentUsername || "Username"}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input 
                    type="password" 
                    placeholder="New Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Update Account</button>
            </form>
        </div>
    );
};

export default AccountSettings;