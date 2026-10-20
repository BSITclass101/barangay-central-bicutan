const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Rivera@1234!",
  database: "barangay_db",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL!");
});

// Test API
app.get("/", (req, res) => {
  res.send("Barangay API is running...");
});

// Login Route (Kailangan na kailangan ito para gumana ang Sign In)
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username = ?";
    db.query(sql, [username], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const user = results[0];

        if (user.status !== 'active') {
            return res.status(403).json({ message: "Account is inactive" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        res.json({ 
            message: "Login successful", 
            userId: user.id, 
            username: user.username, 
            role_id: user.role_id 
        });
    });
});

// Start Server
app.listen(5000, "0.0.0.0", () => {
  console.log("🚀 Server running at http://localhost:5000");
});