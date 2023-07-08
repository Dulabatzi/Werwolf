<template>
  <div class="player-wait-screen">
    <h2>Spielmeister Vorbereitungsbereich</h2>
    <h3>Der Spiel Code lautet: {{ URLGameCode }}</h3>
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
    <div class="lows">
    <button @click="leaveGame">Verlassen</button>
    <button @click="handleStartGame">Das Spiel Starten</button>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { deleteGamesGameClient, getPlayersGameClient, updateGameStatusClient } from '../client/game.client';
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
  fetchPlayers(URLGameCode.value);
  fetchInterval = setInterval(() => fetchPlayers(URLGameCode.value), 1000);
});

onUnmounted(() => {
  clearInterval(fetchInterval);
});

async function fetchPlayers(URLGameCode) {
  try {
    const response = await getPlayersGameClient(URLGameCode);
    if (response.status === 200) {
      players.value = response.data.filter(player => player.gamecode === URLGameCode);
      console.log('Spielerdaten erfolgreich abgerufen:', players.value);
    } else {
      console.error('Fehler beim Abrufen der Spielerdaten:', response.statusText);
    }
  } catch (error) {
    console.error('Fehler beim Abrufen der Spielerdaten:', error.message);
  }
}

async function leaveGame() {
  try {
    await deleteGamesGameClient(URLGameCode.value);
    router.push('/');
  } catch (error) {
    console.error('Fehler beim Löschen des Spiels:', error.message);
  }
}

async function startGame() {
  try {
    await updateGameStatusClient(URLGameCode.value);
    router.push('/hostscreen/' + String(URLGameCode.value));
  } catch (error) {
    console.error('Fehler beim Löschen des Spiels:', error.message);
  }
}

function handleStartGame() {
  if (players.value.length < 8) {
    alert('Es müssen mindestens 8 Spieler in der Lobby sein, um das Spiel starten zu können.');
  } else {
    startGame();
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
.lows {
  display: flex;
  justify-content: left;
  margin-top: 20px;
}

</style>
