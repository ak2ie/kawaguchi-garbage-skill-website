import { OAuth } from "../src/OAuth";
import axios from "axios";
import * as admin from "firebase-admin";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

admin.initializeApp({});

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
  });
});

describe("アクセストークン保存", () => {
  it("正常", () => {
    // https://itnext.io/firebase-firestore-unit-testing-with-jest-and-kind-of-typescript-e26874196b1e
    const [collection, doc, set] = firestoreSetHelper({ "token": "dummy_token" });

    const oauth = new OAuth();
    oauth.saveFirebaseToken("dummy_id", "dummy_token");

    expect(collection).toHaveBeenCalledWith("firebaseTokens");
    expect(doc).toHaveBeenCalledWith("dummy_id");
    expect(set).toHaveBeenCalledWith({ token: "dummy_token" });
  });
});


/**
 * firestoreへの保存(set)確認用モック
 * @param {{ [key: string]: string }} data 保存されるデータ
 * @return タプル（collection, doc, setそれぞれのjest.fn())
 */
function firestoreSetHelper(data: { [key: string]: string }) {
  const set = jest.fn();
  const doc = jest.fn(() => ({ set }));
  const collection = jest.spyOn(admin.firestore(), 'collection').mockReturnValue(({ doc } as unknown) as any);
  return [collection, doc, set];
}

// /**
//  * アクセストークンエンドポイントのモック
//  * @param access_token 返却するアクセストークン
//  * @param token_type 返却するトークンの種類
//  * @param expires_in 返却する有効時間（秒）
//  * @param refresh_token 返却するリフレッシュトークン
//  */
// function OAuthAccessTokenEndpointMock(access_token = "test_access_token", token_type = "test_token_type", expires_in = 3600, refresh_token = "test_refresh_token") {
//   mockedAxios.post.mockImplementation((request, data) => {
//     return new Promise((resolve) => resolve({
//       data: {
//         access_token: access_token,
//         token_type: token_type,
//         expires_in: expires_in,
//         refresh_token: refresh_token
//       }
//     }));
//   });
// }

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