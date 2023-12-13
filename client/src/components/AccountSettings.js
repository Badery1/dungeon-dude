import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AccountSettings = ({ onLogout }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [currentUsername, setCurrentUsername] = useState('');
    const navigate = useNavigate();

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

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
        if (confirmDelete) {
            try {
                await axios.delete('/delete_account');
                alert('Account deleted successfully.');
                onLogout();
                navigate('/');
            } catch (error) {
                console.error('Error deleting account:', error.response?.data);
            }
        }
    };

    return (
        <div className="account-settings-container">
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
            <button 
                onClick={handleDeleteAccount} 
                className="delete-account"
            >
                Delete Account
            </button>
        </div>
    );
};

export default AccountSettings;