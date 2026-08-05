'use client';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function SearchForm() {
    const [question, setQuestion] = useState('');
    // const [results, setResults] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<
        {
            role: 'user' | 'assistant';
            content: string;
        }[]
    >([]);

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();

        if (!question.trim()) return;

        const userMessage = {
            role: 'user' as const,
            content: question,
        };

        const updatedMessages = [...messages, userMessage];

        setMessages(updatedMessages);

        setLoading(true);
        // setResults('');
        setQuestion('');

        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question,
                    messages: updatedMessages,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // setResults(data.answer);
                setMessages([
                    ...updatedMessages,
                    {
                        role: 'assistant',
                        content: data.answer,
                    },
                ]);
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
        <div className="flex flex-col h-screen bg-white">
            {/* Header */}
            {/* <div className="border-b border-gray-200 px-6 py-4 text-center">
                <h1 className="text-xl font-semibold text-gray-900">
                    AI Assistant
                </h1>
                <p className="text-sm text-gray-500">
                    Ask questions about your knowledge base
                </p>
            </div> */}

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-6 py-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center mt-24">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl">
                                🤖
                            </div>

                            <h2 className="mt-6 text-3xl font-semibold text-gray-800">
                                How can I help you today?
                            </h2>

                            <p className="mt-3 text-gray-500 max-w-xl">
                                Ask anything about your uploaded documents and I
                                will answer using your knowledge base.
                            </p>
                        </div>
                    )}

                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${
                                message.role === 'user'
                                    ? 'justify-end'
                                    : 'justify-start'
                            }`}
                        >
                            <div
                                className={`max-w-3xl rounded-2xl px-5 py-4 shadow-sm ${
                                    message.role === 'user'
                                        ? 'bg-black text-white'
                                        : 'bg-gray-100 text-gray-900'
                                }`}
                            >
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-2xl px-5 py-4 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100" />
                                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 bg-white px-6 py-5">
                <div className="max-w-4xl mx-auto">
                    <form
                        onSubmit={handleSearch}
                        className="relative rounded-3xl border border-gray-300 bg-white shadow-sm"
                    >
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Message AI Assistant..."
                            rows={1}
                            className="w-full resize-none rounded-3xl bg-transparent px-6 py-5 pr-24 outline-none"
                        />

                        <button
                            type="submit"
                            disabled={loading || !question.trim()}
                            className="absolute bottom-3 right-3 rounded-full bg-black px-6 py-2 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Send
                        </button>
                    </form>

                    <p className="mt-3 text-center text-xs text-gray-400">
                        AI Assistant can make mistakes. Verify important
                        information.
                    </p>
                </div>
            </div>
        </div>
    );
}
