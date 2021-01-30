import * as request from "supertest";
import * as app from "../src/App";
import { OAuth } from "../src/OAuth";
// import * as admin from "firebase-admin";
// import axios from "axios";

jest.mock("../src/OAuth");
const mockedOAuth = (OAuth as unknown) as jest.Mock;

// エミュレータで認証を使う
// process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";

describe("API:Firebaseトークン取得", () => {
  it("正常", async () => {
    // トークン取得結果をモック
    mockedOAuth.mockImplementation(() => {
      return {
        getFirebaseToken: () => {
          return new Promise((resolve, _) => {
            resolve("dummy_token");
          });
        },
      }
    });

    // 呼び出し
    const response = await request(app)
      .post("/auth/firebasetoken")
      .send({ code: "dummy_id" });

    // 結果
    expect(response.body).toEqual({ token: "dummy_token" });
    expect(response.status).toEqual(200);
  });

  it("異常（POSTデータなし）", async () => {
    // 呼び出し
    const response = await request(app)
      .post("/auth/firebasetoken");
    // .send({ code: "dummy_id" }); => 必要なデータが送信されなかったとき

    expect(response.status).toEqual(500);
  })
});

// describe("地域登録", () => {
//   it("正常", async () => {
//     try {
//       // IDトークンを取得
//       const idToken = await getIdTokenFromCustomToken();

//       const response = await request(app)
//         .post("/region/regist")
//         .send({ region: "aoki1", id: "dummy_id2" })
//         .set("Authorization", idToken)  // IDトークンを渡したい（アカウントの種類は問わない）
//         .set("Content-Type", "application/json");

//       expect(response.status).toEqual(200);
//       expect(response.body).toEqual("OK");
//     } catch (error) {
//       console.error(error);
//     }
//   });
// });

// /**
//  * テスト用Firebaseトークン生成
//  */
// async function getIdTokenFromCustomToken() {
//   const customToken = await admin.auth().createCustomToken("hogehoge");
//   console.log(customToken);
//   // const url = `http://localhost:9099/identitytoolkit.googleapis.com/v3/relyingparty/verifyCustomToken?key=AIzaSyBVw1ofgmYuUspiqzMmG2gACaj20LLLsAs`;
//   const url = "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=AIzaSyBVw1ofgmYuUspiqzMmG2gACaj20LLLsAs";
//   const data = {
//     token: customToken,
//     returnSecureToken: true
//   };

//   const response = await axios.post(url, data);
//   return response.data.idToken;
// }