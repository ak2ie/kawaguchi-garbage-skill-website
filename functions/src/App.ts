import * as express from "express";
import * as cors from "cors";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { AuthorizationCode } from "simple-oauth2";
import { OAuth } from "./OAuth";
import * as crypto from "crypto";
import * as cookieparser from "cookie-parser";
import { FireStore } from "./FireStore";

const app = express();

// JSON対応
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieparser());

/* --------------------------------------------------------
 *  Firebase初期化
 * -------------------------------------------------------- */
admin.initializeApp();

/* --------------------------------------------------------
 *  OAuth
 * -------------------------------------------------------- */
/* ---------- 設定 ---------- */
// 認証情報設定
const client = new AuthorizationCode({
  client: {
    id: functions.config().amazon.client_id,
    secret: functions.config().amazon.client_secret,
  },
  auth: {
    tokenHost: "https://api.amazon.com",
    tokenPath: "/auth/o2/token",
    authorizeHost: "https://www.amazon.com",
    authorizePath: "/ap/oa",
  },
});

/* ---------- Amazon OAuthログイン ---------- */
app.get("/auth/login", async (request, response) => {
  // セッション固定化攻撃対策のため、ランダム文字列を生成
  const state = request.cookies.state || crypto.randomBytes(20).toString("hex");
  // ログイン後コールバックされたときに検証するためCoookieに保存
  response.cookie("state", state.toString(), {
    maxAge: 3600000,
    secure: true,
  });
  // 本番・開発環境の切り替え
  let environment = "prod";
  const referrer = request.get("Referrer");
  if (typeof referrer === "string") {
    environment = referrer.indexOf("localhost") > 0 ? "dev" : "prod";
  }
  response.cookie("environment", environment, {
    maxAge: 3600000,
    secure: true,
  });

  // ログイン画面URL生成
  const authorizationUri = client.authorizeURL({
    redirect_uri: functions.config().amazon.redirect_url,
    scope: "profile",
    state: state,
  });

  functions.logger.info("Amazonログイン開始");
  response.redirect(authorizationUri);
});

/* ---------- Amazon OAuthコールバック ---------- */
app.get("/auth/callback", async (request, response) => {
  const { code, state } = request.query;
  if (typeof code !== "string" && typeof state !== "string") {
    console.error(
      `OAuthコールバックパラメータが異常: code=${code}, state=${state}`
    );
    response.status(500);
  }

  try {
    if (request.cookies.state !== state) {
      // セッション固定化攻撃対策 失敗
      throw new Error(
        `stateが一致しません cookie=${request.cookies.state}, query.state=${state}`
      );
    }

    if (typeof code === "string") {
      // アクセストークン取得
      const options = {
        code,
        redirect_uri: functions.config().amazon.redirect_url,
      };
      const tokenResponse = await client.getToken(options);
      const oauth = new OAuth();
      const accessToken = tokenResponse.token.access_token;
      if (typeof accessToken === "string") {
        const profile = await oauth.getProfile(accessToken);

        const uid =
          request.cookies.state || crypto.randomBytes(20).toString("hex");
        // Firebseトークン取得・保存
        await oauth.saveFirebaseToken(
          uid,
          await admin.auth().createCustomToken("amazon:" + profile.user_id)
        );
        functions.logger.info("Amazonログイン成功:" + profile.user_id);
        // 本番・開発環境に応じてWebサイトにリダイレクト
        if (request.cookies.environment === "dev") {
          response.redirect("http://localhost:8080/logining?uid=" + uid);
        } else {
          response.redirect(
            "https://kawaguchi-garbage-skill.web.app/logining?uid=" + uid
          );
        }
      } else {
        throw new Error(
          "アクセストークン取得失敗:" + JSON.stringify(tokenResponse)
        );
      }
    } else {
      throw new Error("認可コードが異常:" + code);
    }
  } catch (error) {
    functions.logger.error(error);
    response.status(500).send();
  }
});

/* ---------- Firebaseトークン返却 ---------- */
app.post("/auth/firebasetoken", async (request, response) => {
  try {
    const code = request.body.code;
    if (typeof code === "string") {
      const oauth = new OAuth();
      const token = await oauth.getFirebaseToken(code);

      functions.logger.info("Firebaseトークン正常返却");
      response.status(200).send({ token: token });
    } else {
      throw new Error("パラメータが異常 query.code=" + code);
    }
  } catch (error) {
    functions.logger.error(error);
    response.status(500).send();
  }
});

/* --------------------------------------------------------
 *  地域
 * -------------------------------------------------------- */
/* ---------- 地域登録 ---------- */
app.post("/region/regist", async (request, response) => {
  try {
    const idToken = request.header("Authorization");
    if (idToken) {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;
      const { region } = request.body;
      if (region === undefined) {
        throw new Error(`リクエストが異常: region=${region}`);
      }
      const firestore = new FireStore();
      firestore.saveRegion(userId, region);
      response.status(200).send();
    } else {
      throw new Error("未認証");
    }
  } catch (error) {
    functions.logger.error(error);
    response.status(500).send();
  }
});

module.exports = app;
