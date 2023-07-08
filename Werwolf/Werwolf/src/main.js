import { createApp } from 'vue'
import App from './App.vue'

import { createRouter } from 'vue-router'
import { createWebHistory } from 'vue-router'
import StartScreen from "./components/StartScreen.vue";
import CreateGame from "./components/CreateGame.vue";
import JoinGame from "./components/JoinGame.vue";
import HostScreen from "./components/GamemasterScreen.vue";
import HostWaitScreen from "./components/GamemasterWaitScreen.vue";
import PlayerWaitScreen from "./components/PlayerWaitScreen.vue";
import GameScreen from "./components/PlayerScreen.vue";
import FinalScreen from "./components/Resultscreen.vue";

const app = createApp(App)

createApp(App)

const routes = [
    {path:"/",component:StartScreen},
    {path:"/create",component:CreateGame},
    {path:"/join",component:JoinGame},
    {path:"/hostscreen/:gamecode",component:HostScreen},
    {path:"/waitscreenplayer/:gamecode/:playerID", component:PlayerWaitScreen},
    {path:"/waitscreenhost/:gamecode",component:HostWaitScreen},
    {path:"/gamescreen/:gamecode/:playerID",component: GameScreen},
    {path:"/resultscreen/:gamecode/:playerID",component: FinalScreen}
]

const router = createRouter({
    history: createWebHistory(),
    routes: routes,
})

app.use(router)

app.mount('#app')