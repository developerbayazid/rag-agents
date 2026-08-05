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
        const { data, error } = await supabaseAdmin.rpc('match_movies', {
            query_embedding: embedding,
            match_threshold: 0.35,
            match_count: 10,
        });

        if (error) {
            throw new Error(error.message);
        }

        const context = data?.map((item) => item.content).join('\n\n');

        // Generate answer
        // const response = await openai.responses.create({
        //     model: 'gpt-5-mini',
        //     input: [
        //         {
        //             role: 'developer',
        //             content: `
        //                You are a helpful AI assistant.

        //                 Answer ONLY using the provided context.

        //                 If the answer is not available, say:
        //                 "I couldn't find that information in the provided documents."

        //                 Format your response using Markdown.

        //                 Rules:
        //                 - Always leave one blank line between paragraphs.
        //                 - Always leave one blank line before and after headings.
        //                 - Put each bullet point on its own line.
        //                 - Use tables when comparing data.
        //                 - Use headings (##) for sections.
        //                 - Use **bold** for important values.
        //                 - Never place headings or bullet points on the same line as other text.

        //                 ## Context

        //                 ${context}
        //                 `,
        //         },

        //         ...messages,
        //     ],
        // });
        // Generate answer
        const response = await openai.responses.create({
            model: 'gpt-5-mini',
            input: [
                {
                    role: 'developer',
                    content: `
                       You are an enthusiastic movie expert who loves recommending movies to people. You will be given two pieces of information - some context about movies and a question. Your main job is to formulate a short answer to the question using the provided context. If you are unsure and cannot find the answer in the context, say, "Sorry, I don't know the answer." Please do not make up the answer.
                       Give me answer as a markdown
                       #context
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
