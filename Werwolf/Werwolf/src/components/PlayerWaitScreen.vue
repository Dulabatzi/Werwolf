<template>
    <div class="player-wait-screen">
      <h2>Wartebereich</h2>
      <h3>Warte darauf, dass der Spielmeister das Spiel beginnt</h3>
      <table>
        <thead>
          <tr>
            <th>Spieler</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="player in players" :key="player.playerID">
            <td>{{ player.playername }}</td>
          </tr>
        </tbody>
      </table>
      <button @click="leaveGame">Verlassen</button>
    </div>
  </template>
  
  <script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { deletePlayersGameClient, getPlayersGameClient, getGamesGameClient } from '../client/game.client';
import { useRoute, useRouter } from 'vue-router';

const URLGameCode = ref('');
const URLPlayerID = ref('');
const players = ref([]);
let fetchInterval;
const router = useRouter();

onMounted(() => {
  const route = useRoute();
  URLGameCode.value = route.params.gamecode;
  URLPlayerID.value = route.params.playerID;
  fetchPlayers();

  fetchInterval = setInterval(fetchPlayers, 1000);
});

onUnmounted(() => {
  clearInterval(fetchInterval);
});

async function fetchPlayers() {
  try {
    const response = await getPlayersGameClient(URLGameCode.value);
    players.value = response.data.filter(player => player.gamecode === URLGameCode.value);
    console.log('Spielerdaten erfolgreich abgerufen:', players.value);
  } catch (error) {
    console.error('Fehler beim Abrufen der Spielerdaten:', error.message);
    throw error;
  }

  // CHECK HOST
  try {
    const response = await getGamesGameClient();
    const gameExists = response.data.some(game => game.gamecode === URLGameCode.value);

    if (!gameExists) {
      clearInterval(fetchInterval);
      alert('Der Gamehost ist nicht mehr da');
      router.push('/');
    }
  } catch (error) {
    console.error('Fehler beim Abrufen der Spielinformationen:', error.message);
    throw error;
  }

  // CHECK START
  try {
    const response = await getGamesGameClient();
    const gameStarted = response.data.find(game => game.gamecode === URLGameCode.value)?.gameStarted;

    if (gameStarted) {
      clearInterval(fetchInterval);
      router.push(`/gamescreen/${URLGameCode.value}/${URLPlayerID.value}`);
    }
  } catch (error) {
    throw error;
  }
}

async function leaveGame() {
  try {
    await deletePlayersGameClient(URLPlayerID.value);
    router.push('/');
  } catch (error) {
    console.error('Fehler beim Löschen des Spielers:', error.message);
  }
}
</script>
  
  <style scoped>
  .player-wait-screen {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  h2 {
    text-align: center;
    margin-bottom: 20px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th,
  td {
    padding: 8px;
    border-bottom: 1px solid #ccc;
    text-align: left;
  }
  
  button {
    margin-top: 20px;
    padding: 8px 16px;
  }
  </style>
  