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
        <div className="flex h-screen flex-col bg-[#f7f7f8]">
            {/* Header */}
            {/* <header className="flex items-center justify-between border-b bg-white px-6 py-4">
                <div>
                    <h1 className="text-xl font-semibold">🤖 Bayazid AI</h1>
                    <p className="text-sm text-gray-500">
                        Knowledge Base Assistant
                    </p>
                </div>

                <button
                    onClick={() => {
                        setMessages([]);
                    }}
                    className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
                >
                    + New Chat
                </button>
            </header> */}

            {/* Chat Messages */}
            <main className="flex-1 overflow-y-auto px-4 py-8">
                <div className="mx-auto max-w-4xl space-y-8">
                    {/* Welcome */}
                    {messages.length === 0 && (
                        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl shadow">
                                🤖
                            </div>

                            <h2 className="mt-6 text-3xl font-semibold">
                                How can I help you today?
                            </h2>

                            <p className="mt-3 max-w-xl text-gray-500">
                                Ask questions about your uploaded documents. I
                                will search your knowledge base and provide
                                answers.
                            </p>

                            <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                {[
                                    'Find me some action movies',
                                    'Which movie should I watch tonight?',
                                    'Recommend me some highly rated movies?',
                                    'Which movies have rating above 8?',
                                ].map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => setQuestion(item)}
                                        className="rounded-xl border bg-white px-5 py-3 text-left text-sm hover:bg-gray-50"
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Messages */}

                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex gap-3 ${
                                message.role === 'user'
                                    ? 'justify-end'
                                    : 'justify-start'
                            }`}
                        >
                            {/* Avatar */}

                            {message.role === 'assistant' && (
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-white">
                                    AI
                                </div>
                            )}

                            <div
                                className={`max-w-3xl rounded-2xl px-5 py-4 shadow-sm ${
                                    message.role === 'user'
                                        ? 'bg-white text-white'
                                        : 'bg-white text-gray-900'
                                }`}
                            >
                                <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown>
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                            </div>

                            {message.role === 'user' && (
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200">
                                    U
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Loading */}

                    {loading && (
                        <div className="flex gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
                                AI
                            </div>

                            <div className="rounded-2xl bg-white px-5 py-4 shadow">
                                <div className="flex gap-1">
                                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></span>

                                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]"></span>

                                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]"></span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Input Area */}

            <footer className="bg-white px-4 py-5">
                <form
                    onSubmit={handleSearch}
                    className="mx-auto flex max-w-4xl items-end gap-3 rounded-3xl border bg-white p-3 shadow-lg"
                >
                    <button
                        type="button"
                        className="rounded-full p-3 hover:bg-gray-100"
                    >
                        📎
                    </button>

                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Message Bayazid AI..."
                        rows={1}
                        className="max-h-40 flex-1 resize-none bg-transparent px-3 py-3 outline-none"
                    />

                    <button
                        type="submit"
                        disabled={loading || !question.trim()}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white disabled:opacity-40"
                    >
                        ↑
                    </button>
                </form>

                <p className="mt-3 text-center text-xs text-gray-400">
                    AI can make mistakes. Verify important information.
                </p>
            </footer>
        </div>
    );
}
