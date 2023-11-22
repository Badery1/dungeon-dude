import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import ParentComponent from './components/ParentComponent';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    return (
        <Router>
            <ParentComponent isLoggedIn={isLoggedIn} setLoggedIn={setIsLoggedIn} />
        </Router>
    );
};

export default App;