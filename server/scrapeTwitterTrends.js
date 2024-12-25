const puppeteer = require('puppeteer');
const { MongoClient } = require('mongodb');
const uuid = require('uuid');
const os = require('os');
require('dotenv').config(); // Load environment variables

const mongoURI = process.env.MONGO_URI; // MongoDB URI from .env
const dbName = 'TwitterTrends';

async function scrapeTwitterTrends() {
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('trendingTopics');

    const browser = await puppeteer.launch({ headless: false }); // Set to false for debugging
    const page = await browser.newPage();

    try {
        // Log in to Twitter
        await page.goto('https://twitter.com/login', { waitUntil: 'networkidle2' });

        // Enter username
        await page.waitForSelector('input[autocomplete="username"]', { timeout: 10000 });
        await page.type('input[autocomplete="username"]', process.env.TWITTER_USERNAME);
        await page.keyboard.press('Enter');

        // Enter password
        await page.waitForSelector('input[autocomplete="current-password"]', { timeout: 10000 });
        await page.type('input[autocomplete="current-password"]', process.env.TWITTER_PASSWORD);
        await page.keyboard.press('Enter');

        // Wait for the homepage to load
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        // Wait for the trends section
        await page.waitForSelector('[data-testid="primaryColumn"]', { timeout: 30000 });

        // Scrape trends
        const trends = await page.evaluate(() => {
            const trendContainer = document.querySelector('[data-testid="primaryColumn"]');
            if (!trendContainer) {
                console.error('Trend container not found');
                return [];
            }

            // Log the structure for debugging
            console.log(trendContainer.innerHTML);

            // Extract trending topics
            const trendElements = trendContainer.querySelectorAll('span');
            if (!trendElements.length) {
                console.error('No trend elements found');
                return [];
            }

            return Array.from(trendElements)
                .filter(el => el.textContent && el.textContent.startsWith('#')) // Example: trends with hashtags
                .map(el => el.textContent)
                .slice(0, 5);
        });

        // Get the IP address
        const networkInterfaces = os.networkInterfaces();
        const ipAddress = Object.values(networkInterfaces)
            .flat()
            .find((iface) => iface && iface.family === 'IPv4' && !iface.internal)?.address || '127.0.0.1';

        // Save data to MongoDB
        const record = {
            _id: uuid.v4(),
            trend1: trends[0] || null,
            trend2: trends[1] || null,
            trend3: trends[2] || null,
            trend4: trends[3] || null,
            trend5: trends[4] || null,
            timestamp: new Date().toISOString(),
            ip_address: ipAddress,
        };

        await collection.insertOne(record);
        console.log('Trends successfully saved to database:', record);

        return record;
    } catch (error) {
        console.error('Error while scraping Twitter trends:', error);
        throw error;
    } finally {
        await browser.close();
        await client.close();
    }
}

module.exports = scrapeTwitterTrends;  