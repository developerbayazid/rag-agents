'use client';

import { splitText } from '@/utils/splitText';
import { useState } from 'react';

export default function DocumentForm() {
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        setLoading(true);

        try {
            const chunks = await splitText(content);
            console.log(chunks);

            const res = await fetch('/api/documents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: chunks.map((chunk) => chunk.pageContent),
                }),
            });

            const data = await res.json();

            console.log(data);

            alert('Saved!');

            setContent('');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="container mx-auto mt-20 space-y-4"
        >
            <textarea
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="border p-4 w-full rounded"
                placeholder="Write your document..."
            />

            <button
                className="bg-black text-white px-5 py-2 rounded hover:cursor-pointer disabled:opacity-50"
                type="submit"
                disabled={loading}
            >
                {loading ? 'Data submitting...' : 'Submit'}
            </button>
        </form>
    );
}
