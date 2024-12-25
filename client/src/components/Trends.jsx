import React, { useState } from "react";
import { scrapeTrends } from "../api/trends";

const Trends = () => {
    const [trends, setTrends] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTrends = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await scrapeTrends();
            setTrends(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-gray-100 flex flex-col items-center py-12 px-4">
            <h1 className="text-5xl font-bold mb-10">Twitter Trends</h1>
            <button
                onClick={fetchTrends}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
            >
                Fetch Trends
            </button>
            {loading && <p className="mt-6 text-xl animate-pulse">Loading...</p>}
            {error && (
                <p className="mt-6 text-lg text-red-500">
                    Error: {error}
                </p>
            )}
            {trends && (
                <div className="mt-12 w-full max-w-4xl bg-gray-900 p-8 rounded-lg shadow-lg">
                    <h2 className="text-3xl font-semibold mb-6">
                        Trending Topics (As of {new Date(trends.timestamp).toLocaleString()})
                    </h2>
                    <ul className="space-y-4 text-lg">
                        <li className="border-b border-gray-700 pb-2">
                            <span className="text-purple-400 font-medium">1. </span>
                            {trends.trend1 || "Not available"}
                        </li>
                        <li className="border-b border-gray-700 pb-2">
                            <span className="text-purple-400 font-medium">2. </span>
                            {trends.trend2 || "Not available"}
                        </li>
                        <li className="border-b border-gray-700 pb-2">
                            <span className="text-purple-400 font-medium">3. </span>
                            {trends.trend3 || "Not available"}
                        </li>
                        <li className="border-b border-gray-700 pb-2">
                            <span className="text-purple-400 font-medium">4. </span>
                            {trends.trend4 || "Not available"}
                        </li>
                        <li className="border-b border-gray-700 pb-2">
                            <span className="text-purple-400 font-medium">5. </span>
                            {trends.trend5 || "Not available"}
                        </li>
                    </ul>
                    <p className="mt-8 text-gray-400">
                        <span className="text-gray-100 font-semibold">IP Address:</span> {trends.ip_address}
                    </p>
                    <div className="mt-6 bg-gray-800 p-4 rounded-md overflow-x-auto">
                        <h3 className="text-2xl mb-4 font-semibold">JSON Data</h3>
                        <pre className="text-sm bg-gray-700 p-4 rounded-md">
                            {JSON.stringify(trends, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Trends;
