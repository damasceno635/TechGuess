const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST || "db",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "techguess",
});

function connectWithRetry() {
  db.connect((err) => {
    if (err) {
      console.error("Erro ao conectar no MySQL:", err.message);
      console.log("Tentando novamente em 3 segundos...");
      setTimeout(connectWithRetry, 3000);
    } else {
      console.log("✅ Conectado ao MySQL!");
    }
  });
}

connectWithRetry();

module.exports = db;