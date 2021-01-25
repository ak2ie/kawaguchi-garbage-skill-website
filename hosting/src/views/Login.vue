<template>
  <v-main>
    <v-container>
      <h1>ログイン</h1>
      <div>
        <a
          href="https://asia-northeast1-kawaguchi-garbage-skill.cloudfunctions.net/app/auth/login"
        >
          <v-img
            src="../assets/btnLWA_gold_195x46.png"
            width="297"
            height="49"
            class="mx-auto"
          />
        </a>
      </div>
    </v-container>
  </v-main>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class Login extends Vue {
  async mounted() {
    if (this.$store.getters.isLogined) {
      // ログイン済ならトップ画面へ遷移
      this.$router.push({ name: "UserHome" });
    }
  }
}
</script>