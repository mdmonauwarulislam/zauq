import app from "./app.js";
import { connectDB } from "./config/db.js";
import HomepageConfig from "./models/HomepageConfig.js";

let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    await connectDB();
    try {
      await HomepageConfig.ensureSingleConfig();
    } catch (e) {
      console.warn(e.message);
    }
    isConnected = true;
  }

  return app(req, res);
}
