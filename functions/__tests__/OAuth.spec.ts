import axios from "axios";
import * as admin from "firebase-admin";
import { FireStore } from "../src/FireStore";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock("../src/FireStore");
const FireStoreMock = FireStore as jest.Mock;

admin.initializeApp({
  "projectId": "oauth"
});

import { OAuth } from "../src/OAuth";

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
  afterEach(() => {
    // モックを初期化(jest.clearAllMocks()ではモックが消えない)
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  it("正常", async () => {
    FireStoreMock.mockImplementation(() => {
      return {
        saveFirebaseToken: () => {
          return new Promise((resolve, _) => {
            resolve("");
          });
        },
      }
    });

    const oauth = new OAuth();
    await oauth.saveFirebaseToken("dummy_id", "dummy_token");

  });
});

describe("アクセストークン取得", () => {
  afterEach(() => {
    // モックを初期化(jest.clearAllMocks()ではモックが消えない)
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  xit("正常", async () => {
    // jest.fnを使う
    const getData = jest.fn(() => "dummy_token");
    const get = jest.fn(() => ({
      exists: true,
      get: getData
    }));
    const deleteFunc = jest.fn();
    const doc = jest.fn(() => ({ get: get, delete: deleteFunc }));
    const collection = jest.spyOn(admin.firestore(), "collection").mockReturnValue(({ doc } as unknown) as any);

    const oauth = new OAuth();
    const token = await oauth.getFirebaseToken("dummy_id");

    expect(collection).toHaveBeenCalledWith("firebaseTokens");
    expect(deleteFunc).toHaveBeenCalledTimes(1);
    expect(token).toBe("dummy_token");
  });

  it("取得正常", async () => {
    FireStoreMock.mockImplementation(() => {
      return {
        getFirebaseToken: () => {
          return new Promise((resolve, _) => {
            resolve("test");
          });
        },
        deleteFirebaseToken: () => {
          return new Promise((resolve, _) => {
            resolve("");
          });
        },
      }
    });

    const oauth = new OAuth();
    const token = await oauth.getFirebaseToken("dummy_id");

    expect(token).toBe("test");
  });
});



// /**
//  * firestoreへの保存(set)確認用モック
//  * @param {{ [key: string]: string }} data 保存されるデータ
//  * @return タプル（collection, doc, setそれぞれのjest.fn())
//  */
// function firestoreSetHelper(data: { [key: string]: string }) {
//   const set = jest.fn();
//   const doc = jest.fn(() => ({ set }));
//   const collection = jest.spyOn(admin.firestore(), 'collection').mockReturnValue(({ doc } as unknown) as any);
//   return [collection, doc, set];
// }

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