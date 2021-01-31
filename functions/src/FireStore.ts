import * as admin from "firebase-admin";

/**
 * FireStore
 */
export class FireStore {
  /**
   * FireStoreインスタンス
   */
  private db = admin.firestore();

  readonly COLLECTION_NAME_USERS = "users";

  /**
   * Firebaseトークンを保存する
   * @param {string} id ID
   * @param {string} token Firebaseトークン
   */
  public async saveFirebaseToken(id: string, token: string) {
    await this.db.collection(this.COLLECTION_NAME_USERS).doc(id).set({
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
      .collection(this.COLLECTION_NAME_USERS)
      .doc(id)
      .get();
    const token = tokenRef.get("token");
    if (typeof token === "string") {
      return token;
    } else {
      return "";
    }
  }

  /**
   * Firebaseトークンを削除する
   * @param {string} id 削除対象ID
   */
  public async deleteFirebaseToken(id: string) {
    await this.db.collection(this.COLLECTION_NAME_USERS).doc(id).set(
      {
        token: admin.firestore.FieldValue.delete(),
      },
      { merge: true }
    );
  }

  /**
   * 地域を保存する
   * @param {string} id ID
   * @param {string} region 地域
   */
  public async saveRegion(id: string, region: string) {
    await this.db.collection(this.COLLECTION_NAME_USERS).doc(id).set(
      {
        region: region,
      },
      { merge: true }
    );
  }

  /**
   * 地域を取得する
   * @param {string} id ID
   * @return {string} 地域
   */
  public async getRegion(id: string): Promise<string> {
    const userRef = await this.db
      .collection(this.COLLECTION_NAME_USERS)
      .doc(id)
      .get();
    const region = userRef.get("region");
    if (typeof region === "string") {
      return region;
    } else {
      return "";
    }
  }
}
