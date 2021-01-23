import { OAuth } from "../src/OAuth";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("認可コード取得", () => {
  it("正常", async () => {
    // アクセストークンエンドポイントのモック
    OAuthAccessTokenEndpointMock("test_access_token");

    // アクセストークン取得
    const oauth = new OAuth();
    const access_token = await oauth.getAccessToken("test_grant_code");

    expect(access_token).toBe("test_access_token");
  });
});

describe("ユーザープロフィール", () => {
  it("正常", async () => {
    // ユーザープロフィールエンドポイントのモック
    OAuthUserProfileEndpointMock();

    // ユーザープロフィール取得
    const oauth = new OAuth();
    const userProfile = await oauth.getProfile("dummy_access_token");

    expect(userProfile).toStrictEqual({
      "user_id": "amznl.account.dummy",
      "email": "example@example.com",
      "name": "山田太郎",
      "postal_code": "1234567"
    });
  })
})

/**
 * アクセストークンエンドポイントのモック
 * @param access_token 返却するアクセストークン
 * @param token_type 返却するトークンの種類
 * @param expires_in 返却する有効時間（秒）
 * @param refresh_token 返却するリフレッシュトークン
 */
function OAuthAccessTokenEndpointMock(access_token = "test_access_token", token_type = "test_token_type", expires_in = 3600, refresh_token = "test_refresh_token") {
  mockedAxios.post.mockImplementation((request, data) => {
    return new Promise((resolve) => resolve({
      data: {
        access_token: access_token,
        token_type: token_type,
        expires_in: expires_in,
        refresh_token: refresh_token
      }
    }));
  });
}

/**
 * ユーザープロフィールエンドポイントのモック
 */
function OAuthUserProfileEndpointMock() {
  mockedAxios.get.mockImplementation((request, data) => {
    return new Promise((resolve) => resolve({
      data: {
        "user_id": "amznl.account.dummy",
        "email": "example@example.com",
        "name": "山田太郎",
        "postal_code": "1234567"
      }
    }));
  });
}