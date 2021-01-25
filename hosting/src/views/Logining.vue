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
import firebase from "firebase/app";
import "firebase/auth";
import axios from "axios";

@Component
export default class OAuthCallback extends Vue {
  @Prop() private authCode!: string;

  async mounted() {
    try {
      console.log("firebaseトークン取得開始");
      // firebaseトークン取得
      const response = await axios.post(
        "https://asia-northeast1-kawaguchi-garbage-skill.cloudfunctions.net/app/auth/firebasetoken",
        {
          code: this.authCode,
        }
      );

      if (typeof response.data.token === "string") {
        console.log("firebaseログイン開始");

        // ログイン処理が完了したら画面遷移する
        this.$store.watch(
          (state, getters) => {
            // ログイン状態を監視
            return getters.isLogined;
          },
          (isLogined, oldVal) => {
            console.log("firebaseログイン成功検知");
            if (isLogined) {
              // ログイン中または、ログイン後にリダイレクトされた場合
              this.$router.push({ name: "UserHome" });
            }
          }
        );

        // 取得成功の場合、firebaseにログインする
        await firebase.auth().signInWithCustomToken(response.data.token);
      }
    } catch (error) {
      console.error(error);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

