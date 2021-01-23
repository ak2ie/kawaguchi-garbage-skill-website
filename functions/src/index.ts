import * as functions from "firebase-functions";
const app = require("./App");

exports.app = functions.region("asia-northeast1").https.onRequest(app);
