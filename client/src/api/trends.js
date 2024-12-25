import axios from 'axios';

const API_URL = 'https://twitter-trend-nu.vercel.app/api/trends';

export const scrapeTrends = async () => {
    try {
        const response = await axios.get(`${API_URL}/scrape`);
        return response.data;
    } catch (error) {
        throw new Error(error.response.data.error || 'Failed to fetch trends');
    }
};
