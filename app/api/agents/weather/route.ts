import { weatherAgent2 } from '@/utils/agents/weather2';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { query } = await request.json();

        const result = await weatherAgent2(query);

        return NextResponse.json({
            response: result.response,
            logs: result.logs,
        });
    } catch (error) {
        console.error('WEATHER AGENT ERROR:', error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : String(error),
            },
            { status: 500 },
        );
    }
}
