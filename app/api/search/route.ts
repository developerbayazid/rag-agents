import { openai } from '@/lib/openai';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { question, messages } = await request.json();

        if (!question) {
            return NextResponse.json(
                { error: 'Question is required' },
                { status: 400 },
            );
        }

        // Create embedding
        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: question,
        });

        const embedding = embeddingResponse.data[0].embedding;

        // Vector search
        const { data, error } = await supabaseAdmin.rpc('match_documents', {
            query_embedding: embedding,
            match_threshold: 0.35,
            match_count: 3,
        });

        if (error) {
            throw new Error(error.message);
        }

        const context = data?.map((item: any) => item.content).join('\n\n');

        // Generate answer
        const response = await openai.responses.create({
            model: 'gpt-5-mini',
            input: [
                {
                    role: 'developer',
                    content: `
                    Answer using the context.

                    Context:

                    ${context}
                `,
                },

                ...messages,
            ],
        });

        return NextResponse.json({
            answer: response.output_text,
            data,
        });
    } catch (error) {
        console.error('SEARCH ERROR:', error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            {
                status: 500,
            },
        );
    }
}
