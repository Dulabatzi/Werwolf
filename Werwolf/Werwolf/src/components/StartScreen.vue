<template>
  <div class="main">
    <h2>Herzlich Willkommen bei Werwolf</h2>
    <RouterLink to="/join">
      <button @click="joinGame">Spiel Beitreten</button>
    </RouterLink>

    <RouterLink to="/create">
      <button @click="createGame">Spiel Erstellen</button>
    </RouterLink>

  </div>
</template>

<script setup>
</script>

<style scoped>

</style>