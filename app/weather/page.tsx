'use client';

import { useState } from 'react';

const WeatherPage = () => {
    const [weather, setWeather] = useState('');
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const response = await fetch('/api/agents/weather', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: 'give me weather update for my location',
            }),
        });

        const data = await response.json();

        setLogs(data.logs);
        // console.log(data.logs);
        console.log(logs);

        setWeather(data.answer);
        console.log(data);
        setLoading(false);
    }

    return (
        <div className="flex flex-col justify-center items-center p-20">
            {!loading && !weather && (
                <button
                    onClick={(e) => handleSubmit(e)}
                    className="bg-black text-white p-4 hover:cursor-pointer"
                >
                    Run Agent
                </button>
            )}

            {loading && <p>Thinking...</p>}
            {logs.map((log, key) => (
                <div
                    key={key}
                    className="flex flex-col p-4 justify-start items-start text-left"
                >
                    <p className="text-gray-600">{log}</p>
                </div>
            ))}

            {weather && <p>{weather}</p>}
        </div>
    );
};

export default WeatherPage;
