const puppeteer = require('puppeteer');
const { MongoClient } = require('mongodb');
const uuid = require('uuid');
const os = require('os');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;
const dbName = 'TwitterTrends';

async function scrapeTwitterTrends() {
    if (!mongoURI) {
        throw new Error("MongoDB URI not set. Check your .env file.");
    }

    const client = new MongoClient(mongoURI);
    try {
        await client.connect();
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }

    const db = client.db(dbName);
    const collection = db.collection('trendingTopics');

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true, // Set to false to observe the login process
            args: [
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
        });

        const page = await browser.newPage();

        page.on('framenavigated', () => {
            console.log('Frame navigated');
        });

        try {
            await page.goto('https://twitter.com/login', { waitUntil: 'networkidle2' });

            // Wait for username field and enter username
            await page.waitForSelector('input[autocomplete="username"]', { timeout: 10000 });
            await page.type('input[autocomplete="username"]', process.env.TWITTER_USERNAME);
            await page.keyboard.press('Enter');

            // Wait for password field and enter password
            await page.waitForSelector('input[autocomplete="current-password"]', { timeout: 10000 });
            await page.type('input[autocomplete="current-password"]', process.env.TWITTER_PASSWORD);
            await page.keyboard.press('Enter');

            // Wait for navigation after password entry
            await page.waitForNavigation({ waitUntil: 'networkidle2' });

            // Check if 2FA is required
            const twoFactorEmailSelector = 'input[name="text"]'; // Change this selector if it changes
            const isTwoFactorPrompt = await page.$(twoFactorEmailSelector);

            if (isTwoFactorPrompt) {
                console.log('2FA required. Entering email...');
                // Fill in the email for 2FA
                await page.waitForSelector(twoFactorEmailSelector, { timeout: 10000 });
                await page.type(twoFactorEmailSelector, process.env.TWITTER_EMAIL);
                await page.keyboard.press('Enter');
                await page.waitForNavigation({ waitUntil: 'networkidle2' });
            }

            // Wait for the main content to load after login
            await page.waitForSelector('[data-testid="primaryColumn"]', { timeout: 30000 });
            const trends = await page.evaluate(() => {
                const trendContainer = document.querySelector('[data-testid="primaryColumn"]');
                if (!trendContainer) return [];

                const trendElements = trendContainer.querySelectorAll('span');
                return Array.from(trendElements)
                    .filter(el => el.textContent.startsWith('#'))
                    .map(el => el.textContent)
                    .slice(0, 5);
            });

           

            const networkInterfaces = os.networkInterfaces();
            const ipAddress = Object.values(networkInterfaces)
                .flat()
                .find(iface => iface && iface.family === 'IPv4' && !iface.internal)?.address || '127.0.0.1';

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
            console.error('Error during scraping:', error);
            throw error;
        } finally {
            await browser.close();
            await client.close();
        }
    } catch (error) {
        console.error('Error launching browser or processing:', error);
        if (browser) await browser.close();
        if (client) await client.close();
        throw error;
    }
}

module.exports = scrapeTwitterTrends;
