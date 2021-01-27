import * as request from "supertest";
import * as app from "../src/App";
import { OAuth } from "../src/OAuth";

jest.mock("../src/OAuth");
const mockedOAuth = (OAuth as unknown) as jest.Mock;

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