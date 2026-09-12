require("dotenv").config();

const express = require("express");
const db = require("./database/database");
const urlRoutes = require("./routes/urlRoutes");

const app = express();


// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});


// Port configuration
const PORT = process.env.PORT || 3000;


// Middleware
app.use(express.json());
app.use(express.static("public"));


// API routes
app.use("/api", urlRoutes);


// Handle unknown API routes
app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});


// Home route
app.get("/", (req, res) => {
    res.send("URL Shortener API is running!");
});


// Redirect short URL
app.get("/:shortCode", (req, res) => {
    const { shortCode } = req.params;

    try {
        const url = db.prepare(`
            SELECT original_url
            FROM urls
            WHERE short_code = ?
        `).get(shortCode);

        if (!url) {
            return res.status(404).json({
                success: false,
                message: "Short URL not found"
            });
        }

        res.redirect(url.original_url);

    } catch (error) {
        console.error("Redirect error:", error);

        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }
});


// Global error handling middleware
app.use((err, req, res, next) => {
    console.error("Error:", err);

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});


// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});