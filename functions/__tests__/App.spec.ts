import * as request from "supertest";
import * as app from "../src/App";
import { OAuth } from "../src/OAuth";
import * as functions from "firebase-functions";

jest.mock("../src/OAuth");
const mockedOAuth = (OAuth as unknown) as jest.Mock;

jest.mock("firebase-functions");
const mockedFunctions = (functions as unknown) as jest.Mock;

describe("API:Firebaseトークン取得", () => {
  it("正常", async () => {
    mockedOAuth.mockImplementation(() => {
      return {
        getFirebaseToken: () => {
          return new Promise((resolve, _) => {
            resolve("dummy_token");
          });
        },
      }
    });

    mockedFunctions.mockImplementation(() => {
      return {
        config: () => {
          return {
            amazon: {
              client_id: "dummy"
            }
          }
        }
      }
    });

    const response = await request(app)
      .post("/auth/firebasetoken")
      .send({ code: "dummy_id" });
    expect(response.body).toEqual({ token: "dummy_token" });
  })
})