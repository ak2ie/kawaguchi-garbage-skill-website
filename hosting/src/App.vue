<template>
  <v-app>
    <div id="app">
      <v-app-bar dense>
        <v-toolbar-title>川口のゴミ分別 地域登録</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-menu left bottom offset-y>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on" v-show="userStatus">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>

          <v-list>
            <div v-if="userStatus">
              <v-list-item @click="logout">
                <v-list-item-title>ログアウト</v-list-item-title>
              </v-list-item>
            </div>
          </v-list>
        </v-menu>
      </v-app-bar>
      <router-view class="content" />
    </div>
  </v-app>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { FirebaseHelper } from "@/firebase";

@Component
export default class App extends Vue {
  public created() {
    // ログイン制御を登録
    const firebaseHelper = new FirebaseHelper();
    firebaseHelper.onAuth();
  }

  get userStatus() {
    // ログインするとtrue
    return this.$store.getters.isLogined;
  }

  /**
   * ログアウト
   */
  public async logout() {
    if (this.$store.getters.isLogined) {
      const firebaseHelper = new FirebaseHelper();
      await firebaseHelper.logout();
    }
    this.$router.push({ name: "Home" });
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
