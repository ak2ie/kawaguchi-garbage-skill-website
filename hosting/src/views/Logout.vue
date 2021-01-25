<template>
  <v-main>
    <v-container>
      <h1>ログアウト中...</h1>
      <v-progress-circular
        :size="50"
        color="primary"
        indeterminate
      ></v-progress-circular>
    </v-container>
  </v-main>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { FirebaseHelper } from "@/firebase";

@Component
export default class Logout extends Vue {
  async mounted() {
    const firebaseHelper = new FirebaseHelper();
    await firebaseHelper.logout();
    this.$router.push({ name: "Home" });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

