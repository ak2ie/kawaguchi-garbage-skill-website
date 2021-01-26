import { FireStore } from "../src/FireStore";
import * as admin from "firebase-admin";

/* -------------------------------------------------------
 * エミュレータを使う設定
 * 　事前に" firebase emulators:start "で起動しておくこと
 * ------------------------------------------------------- */
// firebase接続先をエミュレータに設定
process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
// 実際にデータを書込/読取りするので時間がかかるため、タイムアウト防止
jest.setTimeout(30000);
// firebaseを初期化（IDは何でもよい）
admin.initializeApp({
  projectId: "test"
});

describe("Firebaseトークン保存", () => {
  it("正常", async () => {
    const firestore = new FireStore();
    await firestore.saveFirebaseToken("dummy_id", "dummy_token2");

    const db = admin.firestore();
    const tokenRef = await db.collection("firebaseTokens").doc("dummy_id").get();
    const saved = tokenRef.get("token");

    expect(saved).toBe("dummy_token2");
  });
});

describe("Firebaseトークン取得", () => {
  afterEach(() => {
    // モックを初期化(jest.clearAllMocks()ではモックが消えない)
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it("正常", async () => {
    const db = admin.firestore();
    await db.collection("firebaseTokens").doc("dummy_id").set({ token: "dummy_token" });

    const firestore = new FireStore();
    const token = await firestore.getFirebaseToken("dummy_id");

    expect(token).toBe("dummy_token");
  });

  it("正常(存在しない場合)", async () => {
    // https://itnext.io/firebase-firestore-unit-testing-with-jest-and-kind-of-typescript-e26874196b1e
    const get = jest.fn(() => ({
      exists: false,  // IDに対応するトークンが存在しない
    }));
    const doc = jest.fn(() => ({ get }));
    const collection = jest.spyOn(admin.firestore(), "collection").mockReturnValue(({ doc } as unknown) as any);

    const firestore = new FireStore();
    const token = await firestore.getFirebaseToken("dummy_id");

    // Firebaseトークン用コレクションが参照され
    expect(collection).toHaveBeenCalledWith("firebaseTokens");
    // 引数のIDのドキュメントを取得しようとしたが
    expect(doc).toHaveBeenCalledWith("dummy_id");
    // 存在しないので、空文字が返る
    expect(token).toBe("");
  });
});

describe("Firebaseトークン削除", () => {
  afterEach(() => {
    // モックを初期化(jest.clearAllMocks()ではモックが消えない)
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it("正常", async () => {
    const db = admin.firestore();
    const tokenRef = db.collection("firebaseTokens").doc("dummy_id");
    await tokenRef.set({ token: "dummy_token" });

    const firestore = new FireStore();
    await firestore.deleteFirebaseToken("dummy_id");

    expect((await tokenRef.get()).exists).toBe(false);
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