'use client';

import { useState } from 'react';

interface Result {
    id: number;
    content: string;
    similarity: number;
}

export default function SearchForm() {
    const [question, setQuestion] = useState('');
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(false);

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();

        if (!question.trim()) return;

        setLoading(true);
        setResults([]);

        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setResults(data);
                console.log(data);
            } else {
                console.error(data.error);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto mt-20">
            <form onSubmit={handleSearch} className="space-y-4">
                <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask something..."
                    rows={5}
                    className="w-full border rounded p-4"
                />

                <button
                    disabled={loading}
                    className="bg-black text-white px-6 py-2 rounded disabled:opacity-50 hover:cursor-pointer"
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            <div className="mt-10 space-y-4">
                {results.map((item) => (
                    <div key={item.id} className="border rounded p-4">
                        <p className="text-sm text-gray-500">
                            Similarity: {(item.similarity * 100).toFixed(2)}%
                        </p>

                        <p className="mt-2">{item.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
