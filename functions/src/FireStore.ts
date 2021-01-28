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
    await this.db.collection(this.TOKEN_COLLECTION_NAME).doc(id).set({
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
      .doc(id)
      .get();
    if (!tokenRef.exists) {
      return "";
    }
    const token = tokenRef.get("token");
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
    await this.db.collection(this.TOKEN_COLLECTION_NAME).doc(id).delete();
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
}
