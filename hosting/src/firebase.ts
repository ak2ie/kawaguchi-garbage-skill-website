import firebase from "firebase/app";
import "firebase/auth";
import store from "./store";

export class FirebaseHelper {
  /**
   * ログイン/ログアウト時の処理
   */
  public onAuth() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user !== null) {
        // ログインした場合
        console.log("ログイン");
        store.commit("onAuthStatusChanged", user);
        store.commit("onUserStatusChanged", true);
      } else {
        console.log("ログアウト");
        // ログアウトした場合
        store.commit("onAuthStatusChanged", {});
        store.commit("onUserStatusChanged", false);
      }
    });
  }

  /**
   * ログアウト
   */
  public async logout() {
    await firebase.auth().signOut();
  }
}