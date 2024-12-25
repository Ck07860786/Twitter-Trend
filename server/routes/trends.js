const express = require('express');
const scrapeTwitterTrends = require('../scrapeTwitterTrends');
const router = express.Router();

router.get('/scrape', async (req, res) => {
    try {
        const result = await scrapeTwitterTrends();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
