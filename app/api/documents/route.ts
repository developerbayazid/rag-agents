import { openai } from '@/lib/openai';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const { content } = await request.json();

    if (!Array.isArray(content) || content.length === 0) {
        return NextResponse.json(
            { error: 'content array is required' },
            { status: 400 },
        );
    }

    await Promise.all(
        content.map(async (textChunk: string) => {
            const embeddingResponse = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: textChunk,
            });

            const emData = {
                content: textChunk,
                embedding: embeddingResponse.data[0].embedding,
            };

            const { error } = await supabaseAdmin
                .from('documents')
                .insert(emData);
            if (error) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 500 },
                );
            }
        }),
    );

    return NextResponse.json({ message: 'Thanks for submitting the data' });
}
