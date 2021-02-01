<template>
  <div class="home">
    <p>Alexaスキル「川口のゴミ分別」の地域を登録します。</p>
    <router-link to="/login">ログイン</router-link>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src

@Component({
  components: {
    HelloWorld,
  },
})
export default class Home extends Vue {}
</script>
