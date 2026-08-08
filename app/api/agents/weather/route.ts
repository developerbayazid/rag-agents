import { weatherAgent2 } from '@/utils/agents/weather2';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    const { query } = await request.json();

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const sendLog = (message: string) => {
                controller.enqueue(
                    encoder.encode(
                        `data: ${JSON.stringify({
                            type: 'log',
                            message,
                        })}\n\n`,
                    ),
                );
            };

            try {
                const result = await weatherAgent2(query, sendLog);

                controller.enqueue(
                    encoder.encode(
                        `data: ${JSON.stringify({
                            type: 'answer',
                            message: result.response,
                        })}\n\n`,
                    ),
                );

                controller.close();
            } catch (error) {
                controller.enqueue(
                    encoder.encode(
                        `data: ${JSON.stringify({
                            type: 'error',
                            message:
                                error instanceof Error
                                    ? error.message
                                    : 'Something went wrong',
                        })}\n\n`,
                    ),
                );

                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
        },
    });
}
