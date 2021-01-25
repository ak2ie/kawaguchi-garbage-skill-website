import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    /**
     * ログイン状態
     */
    loginStatus: "logout",
    /**
     * ユーザー情報
     */
    user: {}
  },
  mutations: {
    /**
     * ログイン状態変更
     * @param state 
     * @param loginStatus 
     */
    onUserStatusChanged(state, loginStatus) {
      state.loginStatus = loginStatus ? "login" : "logout";
    },
    onAuthStatusChanged(state, user) {
      state.user = user;
    },
  },
  actions: {},
  modules: {},
  getters: {
    /**
     * ログイン済ならtrue
     * @param {string} state 
     */
    isLogined(state) {
      return state.loginStatus === "login";
    },
  },
  plugins: [
    // 再読み込みしてもデータ保持
    createPersistedState({ storage: window.sessionStorage })
  ],
});
