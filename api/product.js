const express = require("express");
const router = express.Router();
const db = require("./db");

// GET todos os produtos
router.get("/", (req, res) => {
  db.query("SELECT * FROM products", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// GET um produto por ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM products WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.status(404).json({ message: "Produto não encontrado" });
    res.json(result[0]);
  });
});

// POST criar produto
router.post("/", (req, res) => {
  const { name, brand, category, price, ram, storage, description, image, tags } = req.body;
  const sql = `INSERT INTO products (name, brand, category, price, ram, storage, description, image, tags)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [name, brand, category, price, ram, storage, description, image, tags], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Produto criado com sucesso!", id: result.insertId });
  });
});

// PUT atualizar produto
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, brand, category, price, ram, storage, description, image, tags } = req.body;
  const sql = `UPDATE products SET
               name = ?, brand = ?, category = ?, price = ?, ram = ?,
               storage = ?, description = ?, image = ?, tags = ?
               WHERE id = ?`;
  db.query(sql, [name, brand, category, price, ram, storage, description, image, tags, id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Produto não encontrado" });
    res.json({ message: "Produto atualizado com sucesso!" });
  });
});

// DELETE remover produto
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM products WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Produto não encontrado" });
    res.json({ message: "Produto deletado com sucesso!" });
  });
});

module.exports = router;