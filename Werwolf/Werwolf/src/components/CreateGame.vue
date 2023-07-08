<template>
  <div class="main">
    <div class="border">
      <h2>Spiel erstellen</h2>
      <div>
        <label for="gamemaster">Dein Name (Gamemaster):</label>
        <input type="text" id="gamemaster" v-model="gamemasterName" required />
      </div>
      <div>
        <p>Verfügbare Rollen:</p>
        <ul>
          <li v-for="role in availableRoles" :key="role.id" :title="getRoleDescription(role.name)">
            <span class="role-name">{{ role.name }}</span>
            <div class="righty">
              <button @click="toggleRole(role)" :class="{ active: role.isSelected, selected: role.isSelected }">
                {{ role.isSelected ? 'Ausgewählt' : 'Nicht ausgewählt' }}
              </button>
            </div>
          </li>
        </ul>
      </div>
      <div class="lows">
        <button @click="submitForm" :disabled="!gamemasterName">Spiel erstellen</button>
        <RouterLink to="/">
          <button>Zurück</button>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { createGameClient } from '../client/game.client';
import { useRouter } from 'vue-router';

const gamemasterName = ref('');
const availableRoles = ref([
  { id: 3, name: 'Seherin', isSelected: false },
  { id: 4, name: 'Hexe', isSelected: false },
  { id: 5, name: 'Jäger', isSelected: false },
  { id: 6, name: 'Amor', isSelected: false },
  { id: 7, name: 'Leibwächter', isSelected: false },
  { id: 8, name: 'Richter', isSelected: false },
]);

const router = useRouter();

function toggleRole(role) {
  role.isSelected = !role.isSelected;
}

async function submitForm() {
  if (!gamemasterName.value) {
    return;
  }

  try {
    const selectedRoles = availableRoles.value
      .filter(role => role.isSelected)
      .map(role => role.name);

    const formData = {
      hostname: gamemasterName.value,
      roles: selectedRoles,
    };

    const game = await createGameClient(formData);

    router.push('/waitscreenhost/' + String(game.gamecode));
  } catch (error) {
    throw error;
  }
}

function getRoleDescription(roleName) {
  switch (roleName) {
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
.border {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.lows {
  display: flex;
  justify-content: center;
  margin-top: 20px; /* Add margin-top to create spacing */
}

.lows button {
  margin: 0 10px; /* Add horizontal margin between buttons */
}

.righty{
  margin-left: auto;
}

button.selected {
  background-color: darkred;
  color: white;}
  
</style>
