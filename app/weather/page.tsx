'use client';

import { useState } from 'react';

const WeatherPage = () => {
    const [weather, setWeather] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [logs, setLogs] = useState<string[]>([]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        setLoading(true);
        setError('');
        setWeather('');

        try {
            const response = await fetch('/api/agents/weather', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: 'give me weather update for Dhaka, Rampura',
                }),
            });

            const text = await response.text();

            console.log('HTTP status:', response.status);
            console.log('Raw response:', text);

            if (!text) {
                throw new Error(
                    `Server returned an empty response. Status: ${response.status}`,
                );
            }

            const data = JSON.parse(text);

            if (!response.ok) {
                throw new Error(data.error || 'Agent request failed');
            }

            console.log('Response:', data.response);
            console.log('Logs:', data.logs);

            setWeather(data.response);
            setLogs(data.logs);
        } catch (error) {
            console.error('Frontend error:', error);

            setError(
                error instanceof Error ? error.message : 'Something went wrong',
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-20">
            {!loading && !weather && !error && (
                <button
                    onClick={handleSubmit}
                    className="rounded bg-black px-6 py-3 text-white hover:cursor-pointer"
                >
                    Run Agent
                </button>
            )}

            {loading && <div className="text-gray-600">Thinking...</div>}

            <div className="space-y-2">
                {logs.map((log, index) => (
                    <div
                        key={index}
                        className="rounded-lg bg-gray-100 p-3 text-sm"
                    >
                        <span className="mr-2 font-medium">{index + 1}.</span>

                        {log}
                    </div>
                ))}
            </div>

            {error && (
                <div className="mt-6 max-w-lg rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {weather && (
                <div className="mt-6 max-w-lg rounded-xl border bg-white p-6 shadow">
                    <h2 className="mb-3 text-xl font-semibold">
                        Weather Update
                    </h2>

                    <p className="text-gray-700">{weather}</p>
                </div>
            )}
        </div>
    );
};

export default WeatherPage;
