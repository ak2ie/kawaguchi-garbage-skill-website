<template>
  <v-main>
    <v-container>
      <v-row>
        <v-col>
          <div class="home">
            <p>
              お住まいの地域を登録すると、Alexaスキル「川口のゴミ分別」で次のゴミ出しの日が分かるようになります。
            </p>
            <router-link to="/login">ログイン</router-link>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({})
export default class Home extends Vue {}
</script>
