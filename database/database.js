const Database = require("better-sqlite3");

// Create/connect to SQLite database
const db = new Database("./database/urls.db");

// Create urls table
db.prepare(`
    CREATE TABLE IF NOT EXISTS urls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        short_code TEXT UNIQUE NOT NULL,
        original_url TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

console.log("Database connected and table created successfully.");

module.exports = db;