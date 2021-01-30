import * as admin from "firebase-admin";

/**
 * FireStore
 */
export class FireStore {
  /**
   * FireStoreインスタンス
   */
  private db = admin.firestore();

  readonly TOKEN_COLLECTION_NAME = "firebaseTokens";

  /**
   * Firebaseトークンを保存する
   * @param {string} id ID
   * @param {string} token Firebaseトークン
   */
  public async saveFirebaseToken(id: string, token: string) {
    await this.db.collection(this.TOKEN_COLLECTION_NAME).doc().set({
      id: id,
      token: token,
    });
  }

  /**
   * Firebaseトークンを取得する
   * @param {string} id ID
   * @return {string} Firebaseトークン（存在しない場合は空文字）
   */
  public async getFirebaseToken(id: string): Promise<string> {
    const tokenRef = await this.db
      .collection(this.TOKEN_COLLECTION_NAME)
      .where("id", "==", id)
      .get();
    if (tokenRef.empty) {
      return "";
    }
    let token;
    tokenRef.forEach((doc) => {
      token = doc.get("token");
    });
    if (typeof token !== "string") {
      return "";
    }
    return token;
  }

  /**
   * Firebaseトークンを削除する
   * @param {string} id 削除対象ID
   */
  public async deleteFirebaseToken(id: string) {
    const tokenRef = await this.db
      .collection(this.TOKEN_COLLECTION_NAME)
      .where("id", "==", id)
      .get();
    if (tokenRef.empty) {
      return;
    }
    tokenRef.forEach(async (doc) => {
      await doc.data().update({
        token: admin.firestore.FieldValue.delete(),
      });
    });
  }

  /**
   * 地域を保存する
   * @param {string} id ID
   * @param {string} region 地域
   */
  public async saveRegion(id: string, region: string) {
    const user = this.db.collection("users").doc(id);
    await user.update({ region: region });
  }

  /**
   * 地域を取得する
   * @param {string} id ID
   * @return {string} 地域
   */
  public async getRegion(id: string): Promise<string> {
    const user = await this.db.collection("users").doc(id).get();
    if (!user.exists) {
      return "";
    }
    const region = user.get("region");
    if (typeof region === "string") {
      return region;
    } else {
      return "";
    }
  }
}
