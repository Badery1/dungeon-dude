import React from 'react';

const GameOver = () => {
  const handleLoadGame = async () => {
    try {
      const response = await axios.get('/load_game');
      const characterData = response.data;

    } catch (error) {
      console.error('Error loading game:', error);
    }
  };

  return (
    <div>
      <h1>Game Over</h1>
      <p>Well, you died! Better luck next time, loser!</p>
      <button onClick={handleLoadGame}>Load Game</button>
    </div>
  );
};

export default GameOver;