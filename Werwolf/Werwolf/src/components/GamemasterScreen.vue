<template>
  <div class="gamemaster-screen">
    <h2>Spielmeister Bildschirm</h2>
    <img :src="dayOrNightIcon" alt="Day or Night Icon" />
    <h4>Es ist gerade: {{ dayOrNight }}</h4>
    <table>
      <thead>
        <tr>
          <th>Spielername</th>
          <th>Rolle</th>
          <th>Lebendig</th>
          <th>Soll sterben</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="player in players" :key="player.playerID">
          <td :class="{ 'text-red': !player.isAlive }">{{ player.playername }}</td>
          <td :class="{ 'text-red': !player.isAlive }">{{ player.role }}</td>
          <td :class="{ 'text-red': !player.isAlive }">{{ getPlayerStatus(player) }}</td>
          <td>
            <input
              type="checkbox"
              :disabled="!player.isAlive || (player.shouldDie && player.isLocked)"
              v-model="player.shouldDie"
            />
          </td>
        </tr>
      </tbody>
    </table>
    <button @click="saveChanges">Fortfahren</button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getPlayersGameClient, updateLifeStatusGameClient } from '../client/game.client';
import { useRoute, useRouter } from 'vue-router';
import moonIcon from '@/assets/moon.png';
import sunIcon from '@/assets/sun.png';

const URLGameCode = ref('');
const players = ref([]);
const dayOrNight = ref('Nacht');
const router = useRouter();

onMounted(() => {
  const route = useRoute();
  URLGameCode.value = route.params.gamecode;
  fetchPlayers();
});

async function fetchPlayers() {
  try {
    const response = await getPlayersGameClient(URLGameCode.value);
    players.value = response.data
      .filter(player => player.gamecode === URLGameCode.value);
    console.log('Spielerdaten erfolgreich abgerufen:', players.value);
  } catch (error) {
    console.error('Fehler beim Abrufen der Spielerdaten:', error.message);
  }
}

const getPlayerStatus = (player) => (player.isAlive ? 'Ja' : 'Nein');

async function saveChanges() {
  try {
    for (const player of players.value) {
      if (player.shouldDie && player.isAlive) {
        player.isAlive = false;
        await updateLifeStatusGameClient(player.playerID, player.isAlive);
      }
    }
    dayOrNight.value = dayOrNight.value === 'Nacht' ? 'Tag' : 'Nacht';

    console.log('Änderungen erfolgreich gespeichert.');
    await fetchPlayers();

    // Check if all 'Werwolf' players are dead
    const allWerwolvesDead = players.value
      .filter(player => player.role === 'Werwolf')
      .every(player => !player.isAlive);

    // Check if only 'Werwolf's are alive
    const allOthersDead = players.value
      .filter(player => player.role !== 'Werwolf')
      .every(player => !player.isAlive);

    if (allWerwolvesDead) {
      alert('Alle Werwölfe sind tot!');
      router.push('/');
    }

    if (allOthersDead){
      alert ('Die Werwölfe haben gewonnen!');
      router.push('/');
    }
    
  } catch (error) {
    console.error('Fehler beim Speichern der Änderungen:', error.message);
  }
}

const dayOrNightIcon = computed(() => {
  return dayOrNight.value === 'Nacht' ? moonIcon : sunIcon;
});

</script>

<style scoped>
.gamemaster-screen {
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

input[type='checkbox'] {
  margin: 0;
}

.text-red {
  color: red;
}
</style>