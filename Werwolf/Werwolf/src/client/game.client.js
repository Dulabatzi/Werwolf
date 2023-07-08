import axios from 'axios';

// CREATE GAME
export async function createGameClient(formData) {
  const url = `http://localhost:3000/games`;
  try {
    const response = await axios.post(url, formData);
    console.log('Spiel erfolgreich erstellt:', response.data);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Erstellen des Spiels:', error.message);
    throw error;
  }
}

// JOIN GAME
export async function joinGameClient(formData) {
  const url = `http://localhost:3000/players`;
  try {
    const response = await axios.post(url, formData);
    if (response.status === 404) {
      alert('Das Spiel existiert nicht');
    }
    console.log('Spiel erfolgreich beigetreten:', response.data);
    return response.data;

  } catch (error) {
    console.error('Fehler beim Beitritt zum Spiel:', error.message);
    throw error;
  }
}

// GET PLAYERS
export async function getPlayersGameClient(gamecode) {
  const url = `http://localhost:3000/players/`;
  try {
    const response = await axios.get(url);
    console.log('Spieler erfolgreich abgerufen:', response.data);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Abrufen der Spieler:', error.message);
    throw error;
  }
}

// GET GAMES
export async function getGamesGameClient(gamecode) {
  const url = `http://localhost:3000/games/`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// DELETE GAMES
export async function deleteGamesGameClient(gamecode) {
  const url = `http://localhost:3000/games`;
  try {
    const response = await axios.delete(url, {
      data: {
        gamecode
      }
    });
    return response.data;
  } catch (error) {
    console.error('Fehler beim Löschen des Spiels:', error.message);
    throw error;
  }
}

// DELETE PLAYERS
export async function deletePlayersGameClient(playerID) {
  const url = `http://localhost:3000/players`;
  try {
    const response = await axios.delete(url, {
      data: {
        playerID
      }
    });
    console.log('Spieler erfolgreich gelöscht:', response.data);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Löschen des Spielers:', error.message);
    throw error;
  }
}


// START GAME
export async function updateGameStatusClient(gamecode) {
  const url = `http://localhost:3000/games/${gamecode}`; // Include the specific gamecode in the URL
  const gameStarted = true; // Set the gameStatus to true

  try {
    const response = await axios.put(url, {
      gameStarted
    });
    console.log('Spielstatus erfolgreich aktualisiert:', response.data);
    // Additional logic or response handling can be added here
    return response.data;
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Spielstatus:', error.message);
    // Error handling logic can be implemented here
    throw error;
  }
}

// CHANGE LIFE-STATUS
export async function updateLifeStatusGameClient(playerID, isAlive) {
  const url = `http://localhost:3000/players/${playerID}`;

  try {
    const response = await axios.put(url, {
      isAlive
    });
    return response.data;
  } catch (error) {
    console.error('Fehler beim Ändern des Lebensstatus:', error.message);
    throw error;
  }
}