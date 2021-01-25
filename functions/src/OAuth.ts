import axios from "axios";
import * as functions from "firebase-functions";
import * as querystring from "querystring";
import * as admin from "firebase-admin";

/**
 * Amazon OAuth管理
 */
export class OAuth {
  /**
   * Amazon アクセストークン取得エンドポイントURL
   */
  static ACCESS_TOKEN_ENDPOINT = "https://api.amazon.com/auth/o2/token";
  /**
   * Amazon プロフィールエンドポイントURL
   */
  static PROFILE_ENDPOINT = "https://api.amazon.com/user/profile";
  /**
   * 認可コードを使って、アクセストークンを取得する
   * @param {string} authCode 認可コード
   */
  public async getAccessToken(authCode: string) {
    try {
      // アクセストークン取得
      // https://developer.amazon.com/ja/docs/login-with-amazon/authorization-code-grant.html#access-token-request
      const response = await axios.post(
        OAuth.ACCESS_TOKEN_ENDPOINT,
        querystring.stringify({
          grant_type: "authorization_code",
          code: authCode,
          redirect_uri: functions.config().amazon.redirect_url,
          client_id: functions.config().amazon.client_id,
          client_secret: functions.config().amazon.client_secret,
        })
      );
      if (this.isAccessTokenResponse(response.data)) {
        return response.data.access_token;
      }
      throw new Error(
        "アクセストークン取得結果が想定外：" + JSON.stringify(response.data)
      );
    } catch (error) {
      throw new Error("AccessToken取得失敗:" + error);
    }
  }

  /**
   * ユーザープロフィールを取得する
   * @param {string} accessToken アクセストークン
   */
  public async getProfile(accessToken: string) {
    try {
      // ユーザー情報取得
      // https://developer.amazon.com/ja/docs/login-with-amazon/obtain-customer-profile.html#call-profile-endpoint
      const response = await axios.get(OAuth.PROFILE_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (this.isUserProfileResponse(response.data)) {
        return response.data;
      }
      throw new Error(
        "ユーザープロフィール取得結果が想定外：" + JSON.stringify(response.data)
      );
    } catch (error) {
      throw new Error("ユーザープロフィール取得失敗:" + error);
    }
  }

  /**
   * Firebaseトークンを保存する
   * @param {string} id ID
   * @param {string} token Firebaseトークン
   */
  public async saveFirebaseToken(id: string, token: string) {
    try {
      const db = admin.firestore();
      const firebaseTokensRef = db.collection("firebaseTokens");
      await firebaseTokensRef.doc(id).set({
        token: token,
      });
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Firebaseトークンを取得する
   * @param {string} id ID
   */
  public async getFirebaseToken(id: string) {
    const db = admin.firestore();
    const firebaseTokenRef = await db
      .collection("firebaseTokens")
      .doc(id)
      .get();
    if (!firebaseTokenRef.exists) {
      throw new Error(`Firebaseトークンが存在しません id=${id}`);
    }
    const token = firebaseTokenRef.get("token");
    if (typeof token !== "string") {
      throw new Error(`Firebaseトークンを取得できませんでした id=${id}`);
    } else {
      // データを取得したので削除
      await db.collection("firebaseTokens").doc(id).delete();
      return token;
    }
  }

  /**
   * アクセストークンレスポンスであるか
   * @param {object} response 検証したいレスポンス
   * @return {boolean} 検証結果
   */
  private isAccessTokenResponse(
    response: any
  ): response is AccessTokenResponse {
    if (
      response.access_token !== undefined &&
      response.token_type !== undefined &&
      response.expires_in !== undefined &&
      response.refresh_token !== undefined
    ) {
      return true;
    }
    return false;
  }

  /**
   * ユーザープロフィールのレスポンスであるか
   * @param {object} response 検証したいレスポンス
   * @return {boolean} 検証結果
   */
  private isUserProfileResponse(
    response: any
  ): response is UserProfileResponse {
    if (
      response.user_id !== undefined &&
      response.email !== undefined &&
      response.name !== undefined
    ) {
      return true;
    }
    return false;
  }
}
/**
 * アクセストークン取得結果
 * https://developer.amazon.com/ja/docs/login-with-amazon/authorization-code-grant.html#access-token-response
 */
interface AccessTokenResponse {
  /**
   * アクセストークン
   */
  // eslint-disable-next-line camelcase
  access_token: string;
  /**
   * トークンタイプ(bearer)
   */
  // eslint-disable-next-line camelcase
  token_type: string;
  /**
   * 有効時間（秒）
   */
  // eslint-disable-next-line camelcase
  expires_in: string;
  /**
   * リフレッシュトークン
   */
  // eslint-disable-next-line camelcase
  refresh_token: string;
}

/**
 * ユーザープロフィール取得結果
 * https://developer.amazon.com/ja/docs/login-with-amazon/obtain-customer-profile.html#customer-profile-response
 */
interface UserProfileResponse {
  /**
   * ユーザーID
   */
  // eslint-disable-next-line camelcase
  user_id: string;
  /**
   * メールアドレス
   */
  email: string;
  /**
   * 氏名
   */
  name: string;
  // postal_codeは存在しない
}
