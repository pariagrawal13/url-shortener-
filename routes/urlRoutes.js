const express = require("express");
const { nanoid } = require("nanoid");
const db = require("../database/database");

const router = express.Router();


// Health check
router.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "Server is running"
    });
});


// Create short URL
router.post("/shorten", (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({
            success: false,
            message: "URL is required"
        });
    }

    // Validate URL
    try {
        const parsedUrl = new URL(url);

        if (
            parsedUrl.protocol !== "http:" &&
            parsedUrl.protocol !== "https:"
        ) {
            return res.status(400).json({
                success: false,
                message: "Only HTTP and HTTPS URLs are allowed"
            });
        }

        if (!parsedUrl.hostname) {
            return res.status(400).json({
                success: false,
                message: "Invalid URL"
            });
        }

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Invalid URL"
        });
    }

    try {
        const insert = db.prepare(`
            INSERT INTO urls (short_code, original_url)
            VALUES (?, ?)
        `);

        let shortCode;
        let inserted = false;

        while (!inserted) {
            shortCode = nanoid(6);

            try {
                insert.run(shortCode, url);
                inserted = true;

            } catch (error) {
                if (!error.message.includes("UNIQUE constraint failed")) {
                    throw error;
                }
            }
        }

        res.status(201).json({
            success: true,
            shortUrl: `${req.protocol}://${req.get("host")}/${shortCode}`
        });

    } catch (error) {
        console.error("Shorten URL error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create short URL"
        });
    }
});


// Get URL history
router.get("/history", (req, res) => {

    try {
        const rows = db.prepare(`
            SELECT id, short_code, original_url, created_at
            FROM urls
            ORDER BY id DESC
        `).all();

        res.json({
            success: true,
            urls: rows
        });

    } catch (error) {
        console.error("History error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load URL history"
        });
    }
});


// Delete URL
router.delete("/:shortCode", (req, res) => {
    const { shortCode } = req.params;

    try {
        const result = db.prepare(`
            DELETE FROM urls
            WHERE short_code = ?
        `).run(shortCode);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: "Short URL not found"
            });
        }

        res.json({
            success: true,
            message: "URL deleted successfully"
        });

    } catch (error) {
        console.error("Delete error:", error);

        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }
});


module.exports = router;