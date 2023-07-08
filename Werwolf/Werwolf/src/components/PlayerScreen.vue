<template>
  <div class="player-screen">
    <h2>Spielerbildschirm</h2>
    <div>
      <p><strong>Name:</strong> {{ playerName }}</p>
      <p><strong>Lebendig:</strong> {{ alive ? 'Ja' : 'Nein' }}</p>
      <p><strong>Rolle:</strong> <span v-if="roleVisible">{{ role }}</span></p>
      <div class="centering">
        <button @click="toggleRoleVisibility">{{ roleVisible ? 'Rolle verstecken' : 'Rolle anzeigen' }}</button>
        <button @click="toggleRoleDescription">{{ roleDescriptionVisible ? 'Rollenbeschreibung verstecken' : 'Rollenbeschreibung anzeigen' }}</button>
      </div>
    </div>
    <div class="role-description" v-if="roleDescriptionVisible">
      <p>{{ getRoleDescription(role) }}</p>
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

const playerName = ref('');
const role = ref('');
const alive = ref(true);

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
      playerName.value = player.playername;
      role.value = player.role;
      alive.value = !!player.isAlive;
    } else {
      playerName.value = '';
      role.value = '';
      alive.value = false;
    }

    // Check if all 'Werwolf' players are dead
    const allWerwolvesDead = players.value
      .filter(player => player.role === 'Werwolf')
      .every(player => !player.isAlive);

    // Check if only 'Werwolf's are alive
    const allOthersDead = players.value
      .filter(player => player.role !== 'Werwolf')
      .every(player => !player.isAlive);

    if (allWerwolvesDead || allOthersDead) {
      clearInterval(fetchInterval);
      router.push(`/resultscreen/${URLGameCode.value}/${URLPlayerID.value}`);
    }
  } catch (error) {
    console.error('Fehler beim Abrufen der Spielerdaten:', error.message);
    throw error;
  }
}

const roleDescriptionVisible = ref(false);

function toggleRoleDescription() {
  roleDescriptionVisible.value = !roleDescriptionVisible.value;
}

const roleVisible = ref(true);

function toggleRoleVisibility() {
  if(roleDescriptionVisible){
    roleDescriptionVisible.value = false;
  }
  roleVisible.value = !roleVisible.value;
}

function getRoleDescription(roleName) {
  switch (roleName) {
    case 'Dorfbewohner':
      return 'Der Dorfbewohner versucht tagsüber gemeinsam mit anderen Dorfbewohnern die Werwölfe zu identifizieren. Nachts hat der Dorfbewohner keine speziellen Fähigkeiten.'
    case 'Werwolf':
      return 'Der Werwolf wählt jede Nacht mit den anderen Werwölfen ein unschuldiges Dorfmitglied aus, das getötet werden soll.'
      case 'Seherin':
      return 'Die Seherin kann jede Nacht die wahre Identität eines Spielers erfahren, indem sie eine Person auswählt und die Rolle dieser Person erfährt. Die Seherin versucht, die Werwölfe zu identifizieren und den Dorfbewohnern bei ihrer Entscheidung zu helfen.';
    case 'Hexe':
      return 'Die Hexe hat zwei Tränke: einen Heiltrank und einen Gifttrank. Sie kann in jeder Nacht den Heiltrank verwenden, um eine Person vor dem Tod zu bewahren, und einmal im Spiel den Gifttrank, um eine Person zu töten. Die Hexe kann jeden Trank nur einmal verwenden.';
    case 'Jäger':
      return 'Der Jäger hat die Fähigkeit, beim eigenen Tod einen Spieler seiner Wahl mit in den Tod zu reißen.';
    case 'Amor':
      return 'Amor ist der Liebesengel des Dorfes. Er kann in der ersten Nacht zwei Spieler seiner Wahl verlieben. Wenn einer der beiden verliebten Spieler stirbt, stirbt der andere aus gebrochenem Herzen direkt im Anschluss.';
    case 'Leibwächter':
      return 'Der Leibwächter kann jede Nacht eine Person auswählen, um sie zu beschützen. Wenn die ausgewählte Person in derselben Nacht von den Werwölfen angegriffen wird, überlebt sie den Angriff.';
    case 'Richter':
      return 'Der Richter kann in jeder Nacht einen Spieler anklagen. Wenn der Angeklagte ein Werwolf ist, wird er eliminiert. Wenn der Angeklagte ein unschuldiger Dorfbewohner ist, wird der Richter eliminiert.';
    default:
      return '';
  }
}
</script>

<style scoped>
.player-screen {
  max-width: 400px;
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

.role-description {
  margin-top: 20px;
  text-align: center;
}
</style>