import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
import { pool } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM zoho_contacts");
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Listening on ${process.env.PORT}`);
});
