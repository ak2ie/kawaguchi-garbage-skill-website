<template>
  <v-main>
    <v-container>
      <v-row>
        <v-col cols="5" offset="3">
          <h1>地域登録</h1>
          <v-autocomplete
            v-model="selected"
            :items="selections"
            label="お住まいの地域を選択してください"
          ></v-autocomplete>
          <v-btn @click="save" :disabled="!canSave" color="primary">保存</v-btn>
          <p>
            地域を登録したら、Alexaに話しかけてみてください。<br />
            <br />
            「アレクサ、川口のゴミ分別を開いて」<br />
            「次の可燃ゴミの日を教えて」<br />
          </p>
          <v-snackbar v-model="snackbar">
            {{ message }}
          </v-snackbar>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { FirebaseHelper } from "@/firebase";
import axios from "axios";

@Component
export default class UserHome extends Vue {
  /**
   * 地域一覧
   */
  selections: string[] = [
    "青木１～５丁目",
    "赤井",
    "赤井１～４丁目",
    "赤芝新田",
    "赤山",
    "朝日１～６丁目",
    "新井宿",
    "新井町",
    "安行",
    "安行北谷",
    "安行吉蔵",
    "安行小山",
    "安行慈林",
    "安行出羽１～５丁目",
    "安行藤八",
    "安行西立野",
    "安行原",
    "安行吉岡",
    "安行領家",
    "安行領在家",
    "安行領根岸(根岸第１町会）",
    "安行領根岸(根岸第１町会を除く）",
    "飯塚１～４丁目",
    "飯原町",
    "伊刈（小谷場町会）",
    "伊刈（小谷場町会を除く）",
    "石神",
    "江戸１～３丁目",
    "江戸袋１・２丁目",
    "大竹",
    "金山町",
    "上青木１～６丁目",
    "上青木西１～５丁目",
    "川口１丁目",
    "川口２～４丁目",
    "川口５・６丁目",
    "木曽呂（藤堤下）",
    "木曽呂（藤堤下を除く）",
    "北園町",
    "北原台１～３丁目",
    "久左衛門新田",
    "行衛",
    "源左衛門新田（差間町会）",
    "源左衛門新田（差間町会を除く）",
    "神戸（神根）",
    "小谷場",
    "コンフォール西鳩ヶ谷",
    "コンフォール東鳩ヶ谷",
    "在家町",
    "幸町１～３丁目",
    "栄町１～３丁目",
    "坂下町１・２丁目",
    "坂下町３丁目",
    "坂下町４丁目",
    "桜町１・２丁目",
    "桜町３～５丁目（コンフォール東鳩ヶ谷を除く）",
    "桜町６丁目",
    "差間",
    "差間１～３丁目",
    "里（コンフォール西鳩ヶ谷を除く）",
    "芝",
    "芝１～５丁目",
    "芝下１～３丁目",
    "芝新町",
    "芝園町",
    "芝高木１・２丁目",
    "芝塚原１・２丁目",
    "芝中田１・２丁目",
    "芝西１・２丁目",
    "芝東町",
    "芝樋ノ爪１・２丁目",
    "芝富士１・２丁目",
    "芝宮根町",
    "末広１～３丁目",
    "長蔵１～３丁目",
    "長蔵新田",
    "辻",
    "藤兵衛新田",
    "戸塚１～６丁目",
    "戸塚境町",
    "戸塚鋏町",
    "戸塚東１～４丁目",
    "戸塚南１～５丁目",
    "中青木１～５丁目",
    "仲町",
    "並木１～４丁目",
    "並木元町",
    "新堀",
    "新堀町",
    "西青木１～５丁目",
    "西新井宿",
    "西川口１～６丁目",
    "西立野（戸塚）",
    "榛松",
    "榛松１～３丁目",
    "蓮沼",
    "八幡木１・２丁目",
    "八幡木３丁目",
    "鳩ヶ谷本町１丁目",
    "鳩ヶ谷本町２丁目",
    "鳩ヶ谷本町３・４丁目",
    "鳩ヶ谷緑町１・２丁目",
    "原町",
    "東内野",
    "東貝塚",
    "東川口１～６丁目",
    "東本郷",
    "東本郷１・２丁目",
    "東領家１～５丁目",
    "舟戸町",
    "本町１～４丁目",
    "本蓮１～４丁目",
    "本前川１・２丁目",
    "本前川３丁目（根岸第１町会）",
    "本前川３丁目（根岸第１町会を除く）",
    "前上町",
    "前川１～４丁目",
    "前田",
    "前野宿",
    "道合",
    "三ツ和１～３丁目",
    "緑町",
    "南町１・２丁目",
    "南鳩ヶ谷１・２丁目",
    "南鳩ヶ谷３・４丁目",
    "南鳩ヶ谷５・６丁目",
    "南鳩ヶ谷７丁目",
    "南鳩ヶ谷８丁目",
    "南前川１・２丁目",
    "峯",
    "宮町",
    "元郷１～６丁目",
    "柳崎１～５丁目",
    "柳根町",
    "弥平１～４丁目",
    "領家１～５丁目",
  ];
  /**
   * 選択した地域
   */
  selected = "";
  /**
   * 通知を表示するときtrue
   */
  snackbar = false;
  /**
   * 通知メッセージ
   */
  message = "";

  /**
   * 地域保存
   */
  public async save() {
    console.log("地域保存");
    const firebaseHelper = new FirebaseHelper();
    const idToken = await firebaseHelper.getIdToken();
    const axiosModule = axios.create({
      headers: {
        Authorization: idToken,
      },
    });
    await axiosModule.post(
      "https://asia-northeast1-kawaguchi-garbage-skill.cloudfunctions.net/app/region/regist",
      {
        region: this.selected,
      }
    );
    this.message = "保存しました";
    this.snackbar = true;
  }

  async mounted() {
    // 保存済の地域を復元
    const firebaseHelper = new FirebaseHelper();
    const idToken = await firebaseHelper.getIdToken();
    const axiosModule = axios.create({
      headers: {
        Authorization: idToken,
      },
    });
    const response = await axiosModule.get(
      "https://asia-northeast1-kawaguchi-garbage-skill.cloudfunctions.net/app/region/get"
    );
    const region = response.data.region;
    if (typeof region === "string") {
      this.selected = region;
    }
  }

  /**
   * 保存可能であるか
   */
  get canSave() {
    // 地域選択済ならtrue
    return this.selected !== "";
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

