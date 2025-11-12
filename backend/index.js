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
    console.error("Error fetching Zoho contacts:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/constant-contacts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM constant_contacts");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching Constant contacts:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.put("/zoho-contacts/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const setClause = fields
      .map((field, idx) => `"${field}" = $${idx + 1}`)
      .join(", ");

    const query = `UPDATE zoho_contacts SET ${setClause} WHERE id = $${
      fields.length + 1
    } RETURNING *`;
    
    const result = await pool.query(query, [...values, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating contact:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

app.post("/zoho-contacts", async (req, res) => {
  const contact = req.body;
  try {
    const fields = Object.keys(contact);
    const values = Object.values(contact);
    
    if (fields.length === 0) {
      return res.status(400).json({ error: "No contact data provided" });
    }

    const placeholders = fields.map((_, idx) => `$${idx + 1}`).join(", ");
    const fieldNames = fields.map((f) => `"${f}"`).join(", ");

    const query = `INSERT INTO zoho_contacts (${fieldNames}) VALUES (${placeholders}) RETURNING *`;
    const result = await pool.query(query, values);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error creating contact:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});