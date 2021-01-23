import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import firebase from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBVw1ofgmYuUspiqzMmG2gACaj20LLLsAs",
  authDomain: "kawaguchi-garbage-skill.firebaseapp.com",
  projectId: "kawaguchi-garbage-skill",
  storageBucket: "kawaguchi-garbage-skill.appspot.com",
  messagingSenderId: "430067589134",
  appId: "1:430067589134:web:7b24bad290b5a1cac75c5f"
};

firebase.initializeApp(firebaseConfig);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
