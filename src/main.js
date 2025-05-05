import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import Game from "./game/Game";

const game = new Game();

createApp(App).mount("#app");
