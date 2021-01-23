import * as express from "express";
import * as cors from "cors";
import { OAuth } from "./OAuth";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

const app = express();

// JSON対応
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

/* --------------------------------------------------------
 *  Firebase初期化
 * -------------------------------------------------------- */
admin.initializeApp();

/* --------------------------------------------------------
 *  API
 * -------------------------------------------------------- */
app.post("/OAuthLogin", async (request, response) => {
  try {
    if (typeof request.body.code !== "string") {
      throw new Error("コールバックURL異常:" + JSON.stringify(request.query));
    }

    // パラメータから認可レスポンスを取得
    const oauth = new OAuth();
    // アクセストークン取得
    const accessToken = await oauth.getAccessToken(request.body.code);

    // AmazonユーザーID取得
    const userProfile = await oauth.getProfile(accessToken);

    // firebaseユーザー作成
    const firebaseToken = await admin
      .auth()
      .createCustomToken("amazon:" + userProfile.user_id);
    response.status(200).send({
      firebaseToken: firebaseToken,
    });
  } catch (error) {
    functions.logger.error("OAuthユーザー作成エラー：", error);
    response.status(500).send({
      firebaseToken: "",
      error: "ユーザー作成失敗",
    });
  }
});

module.exports = app;
