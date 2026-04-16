const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(path.join(__dirname, "db.sqlite"));
const SECRET = process.env.JWT_SECRET || "secret123";

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1
    )
  `);
});

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ error: "Lipsă token" });
  }

  try {
    const data = jwt.verify(token, SECRET);
    req.userId = data.id;
    next();
  } catch {
    return res.status(401).json({ error: "Token invalid" });
  }
}

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Username, email și parolă sunt obligatorii." });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    db.run(
      "INSERT INTO users(username, email, password) VALUES(?,?,?)",
      [username, email, hash],
      function (err) {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        return res.json({ id: this.lastID });
      }
    );
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email și parolă sunt obligatorii." });
  }

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!user) {
        return res.status(401).json({ error: "Date greșite." });
      }

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        return res.status(401).json({ error: "Date greșite." });
      }

      const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "7d" });
      return res.json({ token });
    }
  );
});

app.get("/me", authMiddleware, (req, res) => {
  db.get(
    "SELECT id, username, email, xp, level FROM users WHERE id = ?",
    [req.userId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!row) {
        return res.status(404).json({ error: "Utilizator inexistent" });
      }

      return res.json(row);
    }
  );
});

app.post("/xp", authMiddleware, (req, res) => {
  const { xp = 10 } = req.body || {};
  const xpToAdd = Number(xp) || 0;

  db.get(
    "SELECT xp, level FROM users WHERE id = ?",
    [req.userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!user) {
        return res.status(404).json({ error: "Utilizator inexistent" });
      }

      let newXP = (user.xp || 0) + xpToAdd;
      let level = user.level || 1;

      while (newXP >= 100) {
        newXP -= 100;
        level += 1;
      }

      db.run(
        "UPDATE users SET xp = ?, level = ? WHERE id = ?",
        [newXP, level, req.userId],
        (updateErr) => {
          if (updateErr) {
            return res.status(500).json({ error: updateErr.message });
          }

          return res.json({ xp: newXP, level });
        }
      );
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
