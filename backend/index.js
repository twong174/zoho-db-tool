import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
import { pool } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/zoho-contacts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM zoho_contacts");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/constant-contacts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM constant_contacts");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.put("/zoho-contacts/:email", async (req, res) => {
  const { email } = req.params;
  const updates = req.body;

  try {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields
      .map((field, idx) => `"${field}" = $${idx + 1}`)
      .join(", ");

    const query = `UPDATE zoho_contacts SET ${setClause} WHERE "Email" = $${
      fields.length + 1
    } RETURNING *`;
    const result = await pool.query(query, [...values, email]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/zoho-contacts", async (req, res) => {
  const contact = req.body;
  try {
    const fields = Object.keys(contact);
    const values = Object.values(contact);
    const placeholders = fields.map((_, idx) => `$${idx + 1}`).join(", ");
    const fieldNames = fields.map((f) => `"${f}"`).join(", ");

    const query = `INSERT INTO zoho_contacts (${fieldNames}) VALUES (${placeholders}) RETURNING *`;
    const result = await pool.query(query, values);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Listening on ${process.env.PORT}`);
});
