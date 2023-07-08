<template>
  <div class="main">
    <h2>Spiel beitreten</h2>
    <div>
      <label for="playerName">Dein Name:  </label>
      <input type="text" id="playername" v-model="playerName" required />
    </div>
    <div>
      <label for="gameCode">Spielschlüssel:  </label>
      <input type="text" id="gameCode" v-model="gameCode" required />
    </div>
    <button @click="submitForm">Beitreten</button>
    <RouterLink to="/">
      <button>Zurück</button>
    </RouterLink>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { joinGameClient, getGamesGameClient } from '../client/game.client';
import { useRouter } from 'vue-router';

const playerName = ref('');
const gameCode = ref('');
const gameStarted = ref(false);
const router = useRouter();
let fetchInterval;

onMounted(() => {
  fetchGame();

  fetchInterval = setInterval(fetchGame, 1000);
});

onUnmounted(() => {
  clearInterval(fetchInterval);
});

async function fetchGame() {
  try {
    const response = await getGamesGameClient(gameCode.value);
    const games = response.data;
    console.log('Games:', games);
    console.log('Type of Games:', typeof games);
    const game = games.find(game => game.gamecode === gameCode.value);
    if (game) {
      gameStarted.value = game.gameStarted;
      console.log('Spiel erfolgreich abgerufen:', game);
    } else {
      console.log('Das Spiel existiert nicht');
    }
  } catch (error) {
    console.error('Fehler beim Abrufen des Spiels:', error.message);
    throw error;
  }
}

function submitForm() {
  console.log(gameStarted.value);
  if (gameStarted.value) {
    clearInterval(fetchInterval);
    alert('Das Spiel hat bereits begonnen.');
    router.push('/');

    return;
  }

  const formData = {
    playername: playerName.value,
    gamecode: gameCode.value
  };

  try {
    joinGameClient(formData)
      .then(response => {
        if (response.status === 404) {
          alert('Das Spiel existiert nicht');
          return;
        }

        const playerID = String(response.playerID);

        console.log('Spiel erfolgreich beigetreten:', response);
        router.push('/waitscreenplayer/' + String(gameCode.value) + '/' + playerID);
      })
      .catch(error => {
        console.error('Fehler beim Beitritt zum Spiel:', error.message);
      });
  } catch (error) {
    console.error('Fehler beim Beitritt zum Spiel:', error.message);
  }
}
</script>

<style scoped>

</style>
