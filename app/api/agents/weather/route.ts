import { weatherAgent } from '@/utils/agents/weather';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const { query } = await request.json();

    const response = await weatherAgent(query);

    return NextResponse.json({
        answer: response?.responseText,
        logs: response?.logs,
    });
}
