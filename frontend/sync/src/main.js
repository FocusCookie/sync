import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import { store } from "./store/store";
import { ApiService } from "./services/api.service";

// Set the base URL of the API calls
ApiService.init("https://localhost:3000/api/");

Vue.config.productionTip = false;

new Vue({
  store,
  router,
  vuetify,
  render: h => h(App)
}).$mount("#app");
