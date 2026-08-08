import { openai } from '@/lib/openai';
import { getCurrentWeather, getLocation, getTools } from '@/tools/tools';

export async function weatherAgent2(
    query: string,
    onLog: (message: string) => void,
) {
    const logs: string[] = [];

    const MAX_ITERATIONS = 5;

    let response = await openai.responses.create({
        model: 'gpt-5-mini',
        input: [
            {
                role: 'developer',
                content:
                    "You are a helpful AI agent. Give highly specific answers based on the information you're provided. Prefer to gather information with the tools provided to you rather than giving basic, generic answers.",
            },
            {
                role: 'user',
                content: query,
            },
        ],
        reasoning: {
            effort: 'low',
        },
        tools: getTools,
    });

    for (let i = 0; i < MAX_ITERATIONS; i++) {
        onLog(`Iteration ${i + 1}`);

        const toolCalls = response.output.filter(
            (item) => item.type === 'function_call',
        );

        // No tool call = agent has finished
        if (toolCalls.length === 0) {
            onLog('Agent finished');

            return {
                response: response.output_text,
                logs,
            };
        }

        const toolOutputs = [];

        for (const toolCall of toolCalls) {
            const args = JSON.parse(toolCall.arguments);

            onLog(
                `Calling ${toolCall.name} with arguments: ${JSON.stringify(args)}`,
            );

            let result: string;

            switch (toolCall.name) {
                case 'getLocation':
                    result = await getLocation();
                    break;

                case 'getCurrentWeather':
                    result = await getCurrentWeather(args.location);
                    break;

                default:
                    throw new Error(`Unknown tool: ${toolCall.name}`);
            }

            onLog(`${toolCall.name} returned: ${result}`);

            toolOutputs.push({
                type: 'function_call_output' as const,
                call_id: toolCall.call_id,
                output: result,
            });
        }

        // Send tool results to the next model turn
        response = await openai.responses.create({
            model: 'gpt-5-mini',
            previous_response_id: response.id,
            input: toolOutputs,
            reasoning: {
                effort: 'low',
            },
            tools: getTools,
        });
    }

    return {
        response: 'I was unable to complete the request.',
        logs,
    };
}
