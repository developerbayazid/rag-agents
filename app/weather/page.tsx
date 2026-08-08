'use client';

import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const WeatherPage = () => {
    const [weather, setWeather] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [logs, setLogs] = useState<string[]>([]);
    const [prompt, setPrompt] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        setLoading(true);
        setError('');
        setWeather('');
        setLogs([]);

        try {
            const response = await fetch('/api/agents/weather', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query:
                        prompt ?? 'give me weather update for Dhaka, Rampura',
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();

                throw new Error(
                    errorText || `Server error: ${response.status}`,
                );
            }

            if (!response.body) {
                throw new Error('Streaming is not supported');
            }

            const reader = response.body.getReader();

            const decoder = new TextDecoder();

            let buffer = '';

            while (true) {
                const { value, done } = await reader.read();

                // Decode incoming data
                buffer += decoder.decode(value || new Uint8Array(), {
                    stream: !done,
                });

                // Process all complete SSE events
                const events = buffer.split('\n\n');

                // Keep incomplete event for next chunk
                buffer = done ? '' : events.pop() || '';

                for (const event of events) {
                    if (!event.trim()) continue;

                    const dataLine = event
                        .split('\n')
                        .find((line) => line.startsWith('data: '));

                    if (!dataLine) continue;

                    const json = dataLine.substring(6);

                    try {
                        const data = JSON.parse(json);

                        console.log('Received:', data);

                        if (data.type === 'log') {
                            setLogs((previous) => [...previous, data.message]);
                            console.log(logs);
                        }

                        if (data.type === 'answer') {
                            setWeather(data.message);
                            console.log(data.message);
                        }

                        if (data.type === 'error') {
                            setError(data.message);
                        }
                    } catch (error) {
                        console.error('Failed to parse SSE data:', json, error);
                    }
                }

                if (done) {
                    break;
                }
            }

            // Process anything left in buffer
            if (buffer.trim()) {
                const dataLine = buffer
                    .split('\n')
                    .find((line) => line.startsWith('data: '));

                if (dataLine) {
                    const json = dataLine.substring(6);

                    try {
                        const data = JSON.parse(json);

                        if (data.type === 'log') {
                            setLogs((previous) => [...previous, data.message]);
                        }

                        if (data.type === 'answer') {
                            setWeather(data.message);
                        }

                        if (data.type === 'error') {
                            setError(data.message);
                        }
                    } catch (error) {
                        console.error(
                            'Failed to parse final SSE data:',
                            json,
                            error,
                        );
                    }
                }
            }
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
                <div className="w-full max-w-2xl">
                    <label
                        htmlFor="query"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        What would you like to know?
                    </label>

                    <div className="group relative">
                        <input
                            onChange={(e) => setPrompt(e.target.value)}
                            type="text"
                            name="query"
                            id="query"
                            placeholder="Ex: Weather update for Dhaka, Bangladesh"
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 pr-14 text-sm text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 hover:border-gray-400 focus:border-black focus:ring-2 focus:ring-black/10"
                        />

                        <button
                            onClick={handleSubmit}
                            type="submit"
                            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-black text-white transition hover:bg-gray-800 hover:cursor-pointer"
                        >
                            ↑
                        </button>
                    </div>

                    <p className="mt-2 text-xs text-gray-400">
                        Ask your AI agent anything about the current weather.
                    </p>
                </div>
            )}

            {loading && <div className="text-gray-600 py-5">Thinking...</div>}

            <div className="w-full max-w-4xl space-y-3">
                {logs.map((log, index) => (
                    <div
                        key={index}
                        className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-sm"
                    >
                        {/* Completed icon */}
                        <div className="mt-0.5 shrink-0">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>

                        {/* Step number + log */}
                        <div className="flex-1">
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-gray-500">
                                    {index + 1}.
                                </span>

                                <span className="leading-6 text-gray-700">
                                    {log}
                                </span>
                            </div>
                        </div>
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
                        Agent Response
                    </h2>

                    <p className="text-gray-700">{weather}</p>
                </div>
            )}
        </div>
    );
};

export default WeatherPage;
