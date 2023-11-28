import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginRegister = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const toggleMode = () => {
        setIsLogin(!isLogin);
    };

    const handleRegistration = async () => {
        try {
            const response = await axios.post('/register', { username, password });
            console.log(response.data);
            navigate('/');
        } catch (error) {
            console.error('Registration error:', error.response?.data);
        }
    };

    const handleLogin = async () => {
        try {
            const response = await axios.post('/login', { username, password });
            console.log(response.data);
            onLogin();
            navigate('/character-selection');
        } catch (error) {
            console.error('Login error:', error.response?.data);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLogin) {
            handleLogin();
        } else {
            handleRegistration();
        }
    };

    return (
        <div>
            <h2>{isLogin ? 'Login' : 'Register'}</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    placeholder="Username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
            </form>
            <button onClick={toggleMode}>
                {isLogin ? 'Need to register?' : 'Already have an account?'}
            </button>
        </div>
    );
};

export default LoginRegister;