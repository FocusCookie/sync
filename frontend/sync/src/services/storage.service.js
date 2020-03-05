import { store } from "../store/store";

/**
 * Manage the how Access Tokens are being stored and retreived from storage.
 *
 * Current implementation stores to vuex store. but it could be also the localStorage in the future
 **/
const TokenService = {
  getToken() {
    return store.getters.token;
  },

  saveToken(token) {
    store.commit("setToken", token);
  },

  removeToken() {
    store.commit("setToken", "");
  }
};

export { TokenService };
