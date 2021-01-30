import { FireStore } from "../src/FireStore";
import * as admin from "firebase-admin";
import axios from "axios";

/* -------------------------------------------------------
 * エミュレータを使う設定
 * 　事前に" firebase emulators:start "で起動しておくこと
 * ------------------------------------------------------- */
// firebase接続先をエミュレータに設定
process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
// 実際にデータを書込/読取りするので時間がかかるため、タイムアウト防止
jest.setTimeout(1000 * 15);
// firebaseを初期化（IDは何でもよい）
const TEST_PROJECT_ID = "test";
admin.initializeApp({
  projectId: TEST_PROJECT_ID
});

describe("Firebaseトークン保存", () => {
  beforeEach(async () => {
    await clearDB();
  });

  it("正常", async () => {
    const firestore = new FireStore();
    await firestore.saveFirebaseToken("dummy_id", "dummy_token3");

    const db = admin.firestore();
    const tokenRef = await db.collection("firebaseTokens").where("id", "==", "dummy_id").get();
    let saved;
    tokenRef.forEach(doc => {
      saved = doc.get("token");
    });

    expect(saved).toBe("dummy_token3");
  });
});

describe("Firebaseトークン取得", () => {

  beforeEach(async () => {
    await clearDB();
  });

  afterEach(() => {
    // モックを初期化(jest.clearAllMocks()ではモックが消えない)
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it("正常", async () => {
    const db = admin.firestore();
    await db.collection("firebaseTokens").doc().set({ id: "dummy_id", token: "dummy_token" });

    const firestore = new FireStore();
    const token = await firestore.getFirebaseToken("dummy_id");

    expect(token).toBe("dummy_token");
  });

  it("正常(ユーザーが存在しない場合)", async () => {
    // https://itnext.io/firebase-firestore-unit-testing-with-jest-and-kind-of-typescript-e26874196b1e
    const get = jest.fn(() => ({
      empty: true,  // ユーザーが存在しない
    }));
    const where = jest.fn(() => ({ get }));
    const collection = jest.spyOn(admin.firestore(), "collection").mockReturnValue(({ where } as unknown) as any);

    const firestore = new FireStore();
    const token = await firestore.getFirebaseToken("dummy_id");

    // Firebaseトークン用コレクションが参照されたが、
    expect(collection).toHaveBeenCalledWith("firebaseTokens");
    // ユーザーが存在しないので、空文字が返る
    expect(token).toBe("");
  });

  it("正常(トークンが存在しない場合)", async () => {
    // https://itnext.io/firebase-firestore-unit-testing-with-jest-and-kind-of-typescript-e26874196b1e
    const forEach = jest.fn();
    const get = jest.fn(() => ({
      empty: false,  // ユーザーは存在する
      forEach: forEach,
    }));
    const where = jest.fn(() => ({ get }));
    const collection = jest.spyOn(admin.firestore(), "collection").mockReturnValue(({ where } as unknown) as any);

    const firestore = new FireStore();
    const token = await firestore.getFirebaseToken("dummy_id");

    // Firebaseトークン用コレクションが参照され、
    expect(collection).toHaveBeenCalledWith("firebaseTokens");
    // ユーザーは存在するのでドキュメントは参照されたが、
    expect(forEach).toHaveBeenCalled();
    // トークンが存在しないので、空文字が返る
    expect(token).toBe("");
  });
});

describe("Firebaseトークン削除", () => {
  beforeEach(async () => {
    await clearDB();
  });

  afterEach(() => {
    // モックを初期化(jest.clearAllMocks()ではモックが消えない)
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it("正常", async () => {
    const db = admin.firestore();
    const tokenRef = db.collection("firebaseTokens");
    await tokenRef.doc()
      .set({ id: "dummy_id", token: "dummy_token" });

    const firestore = new FireStore();
    await firestore.deleteFirebaseToken("dummy_id");

    const userDoc = await tokenRef.where("id", "==", "dummy_id").get();
    // ユーザーIDのドキュメントは存在
    expect(userDoc.empty).toBe(false);
    // トークンは削除済
    userDoc.forEach((doc) => {
      expect(doc.get("token")).toBe(undefined);
    });
  });
});

describe("地域登録", () => {
  beforeEach(async () => {
    await clearDB();
  });

  afterEach(() => {
    // モックを初期化(jest.clearAllMocks()ではモックが消えない)
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it("正常(新規登録)", async () => {
    // ユーザー情報は登録済
    const db = admin.firestore();
    const regionRef = db.collection("users").doc("dummy_id");
    await regionRef.set({ id: "dummy_id" });

    // データ登録
    const firestore = new FireStore();
    await firestore.saveRegion("dummy_id", "aoki1");

    // 登録されたことを確認
    const saved = (await regionRef.get()).get("region")
    expect(saved).toBe("aoki1");
  });

  it("正常(更新)", async () => {
    // 地域は登録済
    const db = admin.firestore();
    const regionRef = db.collection("users").doc("dummy_id");
    await regionRef.set({ id: "dummy_id", region: "aoki1" });

    // データ登録
    const firestore = new FireStore();
    await firestore.saveRegion("dummy_id", "aoki2");

    // 登録されたことを確認
    const saved = (await regionRef.get()).get("region")
    expect(saved).toBe("aoki2");
  });
});

describe("地域取得", () => {
  let db: FirebaseFirestore.Firestore;

  beforeEach(() => {
    db = admin.firestore();
    clearDB();
  });

  afterEach(() => {
    // モックを初期化(jest.clearAllMocks()ではモックが消えない)
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it("正常取得", async () => {
    const regionRef = db.collection("users").doc("dummy_id");
    await regionRef.set({ id: "dummy_id", region: "aoki1" });

    // データ取得
    const firestore = new FireStore();
    const result = await firestore.getRegion("dummy_id");

    expect(result).toEqual("aoki1");
  });

  it("未登録", async () => {
    const regionRef = db.collection("users").doc("dummy_id");
    // 地域は未登録
    await regionRef.set({ id: "dummy_id" });

    const firestore = new FireStore();
    const result = await firestore.getRegion("dummy_id");

    // 未登録なので空文字
    expect(result).toBe("");
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

/**
 * Firestoreエミュレータのデータを全削除する
 */
async function clearDB() {
  await axios.delete(`http://localhost:8080/emulator/v1/projects/${TEST_PROJECT_ID}/databases/(default)/documents`);
}