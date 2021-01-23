<template>
  <v-main>
    <v-container>
      <h1>Loading...</h1>
      <v-progress-circular
        :size="50"
        color="primary"
        indeterminate
      ></v-progress-circular>
    </v-container>
  </v-main>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import axios from "axios";
import firebase from "firebase/app";
import "firebase/auth";

@Component
export default class OAuthCallback extends Vue {
  @Prop() private msg!: string;

  @Prop() private authCode!: string;

  async mounted() {
    console.log("ロード" + this.authCode);
    // firebaseカスタムトークン取得
    const response = await axios.post(
      "https://asia-northeast1-kawaguchi-garbage-skill.cloudfunctions.net/app/OAuthLogin",
      {
        code: this.authCode,
      }
    );
    if (
      typeof response.data.firebaseToken === "string" &&
      response.data.firebaseToken !== ""
    ) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          console.log("認証成功");
        }
      });
      firebase.auth().signInWithCustomToken(response.data.firebaseToken);
    } else {
      console.error(
        "カスタムトークン取得失敗:" + JSON.stringify(response.data)
      );
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

