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
jest.setTimeout(1000 * 30);
const PROJECTID_TEST = "test";
admin.initializeApp({
  projectId: PROJECTID_TEST
});

describe("Firebaseトークン保存", () => {
  beforeEach(async () => {
    await clearDB();
  });

  it("正常", async () => {
    const firestore = new FireStore();
    await firestore.saveFirebaseToken("dummy_id", "dummy_token");

    const db = admin.firestore();
    const tokenRef = await db.collection("users").doc("dummy_id").get();
    const saved = tokenRef.get("token");

    expect(saved).toBe("dummy_token");
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
    await db.collection("users").doc("dummy_id").set({ token: "dummy_token" });

    const firestore = new FireStore();
    const token = await firestore.getFirebaseToken("dummy_id");

    expect(token).toBe("dummy_token");
  });

  it("正常(ユーザーが存在しない場合)", async () => {
    // https://itnext.io/firebase-firestore-unit-testing-with-jest-and-kind-of-typescript-e26874196b1e
    const snapShotGet = jest.fn();
    const get = jest.fn(() => ({
      get: snapShotGet,
    }));
    const doc = jest.fn(() => ({ get }));
    const collection = jest.spyOn(admin.firestore(), "collection").mockReturnValue(({ doc } as unknown) as any);

    const firestore = new FireStore();
    const token = await firestore.getFirebaseToken("dummy_id");

    // Firebaseトークン用コレクションが参照されたが、
    expect(collection).toHaveBeenCalledWith("users");
    // ユーザーが存在しないので、空文字が返る
    expect(token).toBe("");
  });

  it("正常(トークンが存在しない場合)", async () => {
    // https://itnext.io/firebase-firestore-unit-testing-with-jest-and-kind-of-typescript-e26874196b1e
    const snapShotGet = jest.fn();
    const get = jest.fn(() => ({
      get: snapShotGet
    }));
    const doc = jest.fn(() => ({ get }));
    const collection = jest.spyOn(admin.firestore(), "collection").mockReturnValue(({ doc } as unknown) as any);

    const firestore = new FireStore();
    const token = await firestore.getFirebaseToken("dummy_id");

    // Firebaseトークン用コレクションが参照され、
    expect(collection).toHaveBeenCalledWith("users");
    // ユーザーは存在するのでドキュメントは参照されたが、
    expect(snapShotGet).toHaveBeenCalled();
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
    const tokenRef = db.collection("users");
    await tokenRef.doc("dummy_id")
      .set({ token: "dummy_token" });

    const firestore = new FireStore();
    await firestore.deleteFirebaseToken("dummy_id");

    const userDoc = await tokenRef.get();
    // ユーザーIDのドキュメントは存在
    expect(userDoc.empty).toBe(false);
    // トークンは削除済
    expect(userDoc.docs[0].get("token")).toBe(undefined);
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
    await db.collection("users").doc().set({ id: "dummy_id" });

    // データ登録
    const firestore = new FireStore();
    await firestore.saveRegion("dummy_id", "aoki1");

    // 登録されたことを確認
    const userRef = await db.collection("users").where("id", "==", "dummy_id").get();
    userRef.forEach(async (doc) => {
      const user = await db.collection("users").doc(doc.id).get();
      expect(user.get("region")).toBe("aoki2");
    });
  });

  it("正常(更新)", async () => {
    // 地域は登録済
    const db = admin.firestore();
    await db.collection("users").doc("dummy_id").set({ region: "aoki1" });

    // データ登録
    const firestore = new FireStore();
    await firestore.saveRegion("dummy_id", "aoki2");

    // 登録されたことを確認
    const userRef = await db.collection("users").doc("dummy_id").get();
    const saved = userRef.get("region");
    expect(saved).toBe("aoki2");
  });
});

describe("地域取得", () => {
  let db: FirebaseFirestore.Firestore;

  beforeEach(async () => {
    db = admin.firestore();
    await clearDB();
  });

  afterEach(() => {
    // モックを初期化(jest.clearAllMocks()ではモックが消えない)
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it("正常取得", async () => {
    await db.collection("users").doc("dummy_id").set({ region: "aoki1" });

    // データ取得
    const firestore = new FireStore();
    const result = await firestore.getRegion("dummy_id");

    expect(result).toEqual("aoki1");
  });

  it("未登録", async () => {
    await db.collection("users").doc("dummy_id").set({});

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
  await axios.delete(`http://localhost:8080/emulator/v1/projects/${PROJECTID_TEST}/databases/(default)/documents`);
}