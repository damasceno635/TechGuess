const express = require("express");
const cors = require("cors");
const productRoutes = require("./product");

const app = express();

app.use(cors());
app.use(express.json());

// Rotas da API
app.use("/products", productRoutes);

app.listen(3000, () => {
  console.log("API rodando na porta 3000");
});