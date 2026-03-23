const express = require("express");
const router = express.Router();

const db = require("./db");

router.get("/", (req, res) => {
  db.query("SELECT * FROM products", (err, result) => {
    if (err) {
      res.status(500).json(err);
    } else {
      res.json(result);
    }
  });
});

router.post("/", (req, res) => {
  const { name, brand, category, price, ram, storage, description, image, tags } = req.body;

  const sql =
    "INSERT INTO products (name, brand, category, price, ram, storage, description, image, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

  db.query(
    sql,
    [name, brand, category, price, ram, storage, description, image, tags],
    (err, result) => {
      if (err) {
        res.status(500).json(err);
      } else {
        res.json({ message: "Produto criado com sucesso!" });
      }
    }
  );
});

module.exports = router;