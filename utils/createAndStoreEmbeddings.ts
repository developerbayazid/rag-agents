import { openai } from '@/lib/openai';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { splitDocument } from './splitDocument';

export async function createAndStoreEmbeddings(fileName: string) {
    const chunkData = await splitDocument(fileName);
    console.log(chunkData);

    const documents = await Promise.all(
        chunkData.map(async (chunk) => {
            const embeddingResponse = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: chunk.pageContent,
            });

            return {
                content: chunk.pageContent,
                embedding: embeddingResponse.data[0].embedding,
            };
        }),
    );

    const { error } = await supabaseAdmin.from('movies').insert(documents);

    if (error) {
        NextResponse.json({ error: error.message });
    }

    return NextResponse.json({ message: 'Thanks for submitting the data' });
}
