import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    token: ""
  },
  mutations: {
    setToken(state, token) {
      state.token = token;
    }
  },
  getters: {
    token: state => state.token
  }
});
