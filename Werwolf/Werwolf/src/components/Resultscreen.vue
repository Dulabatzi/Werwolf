<template>
    <div class="Final-Screen">
      <h2>Das Spiel ist zuende</h2>
      <h3> {{ result }}</h3>
      <table>
        <thead>
          <tr>
            <th>Spieler</th>
            <th>Rolle</th>
            <th>Lebt noch</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="player in players" :key="player.playerID">
            <td>{{ player.playername }}</td>
            <td>{{ player.role }}</td>
            <td>{{ player.isAlive ? 'Ja' : 'Nein' }}</td>
          </tr>
        </tbody>
      </table>
      <div class="centering">
      <button @click="navigateToHome">Zurück zum Startbildschirm</button>
    </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { getPlayersGameClient } from '../client/game.client';
  import { useRoute, useRouter } from 'vue-router';
  
  const URLGameCode = ref('');
  const URLPlayerID = ref('');
  const players = ref([]);
  let fetchInterval;
  const router = useRouter();
  const result = ref('');
  
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
      players.value = response.data.filter(
        (player) => player.gamecode === URLGameCode.value
      );
  
      const player = players.value.find(
        (player) => player.playerID === parseInt(URLPlayerID.value)
      );
  
      if (player) {
        result.value = getPlayerResult(player);
      } else {
        result.value = 'Spieler nicht gefunden';
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Spielerdaten:', error.message);
      throw error;
    }
  }
  
  function getPlayerResult(player) {
    const isWerwolf = player.role === 'Werwolf';
    const allWerwolvesDead = players.value
      .filter((p) => p.role === 'Werwolf')
      .every((p) => !p.isAlive);
    const allOthersDead = players.value
      .filter((p) => p.role !== 'Werwolf')
      .every((p) => !p.isAlive);
  
    if ((isWerwolf && allWerwolvesDead) || (!isWerwolf && allOthersDead)) {
      return 'Du hast verloren';
    } else {
      return 'Du hast gewonnen';
    }
  }

  function navigateToHome() {
  router.push('/');
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
  
  .centering {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
  </style>
  
  