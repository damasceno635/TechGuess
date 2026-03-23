const express = require("express");
const cors = require("cors");
const path = require("path");

const productRoutes = require("./product");

const app = express();

app.use(cors());
app.use(express.json());

// Rotas da API
app.use("/products", productRoutes);

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, "frontend")));

// Rota para admin
app.use("/admin", express.static(path.join(__dirname, "frontend/admin")));

// Rota padrão
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/index.html"));
});

// Rota específica para admin
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/admin/dashboard.html"));
});

app.listen(3000, () => {
  console.log("API rodando na porta 3000");
  console.log("Frontend: http://localhost:3000");
  console.log("Admin: http://localhost:3000/admin");
});