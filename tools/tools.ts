export async function getCurrentWeather(location: string): Promise<string> {
    const weather = {
        location: location,
        temperature: '72',
        unit: 'F',
        forecast: 'sunny',
    };
    return JSON.stringify(weather);
}

export async function getLocation(): Promise<string> {
    return 'Dhaka, Bangladesh';
}

export const getTools = [
    {
        type: 'function' as const,
        name: 'getLocation',
        description: "Get the user's current location.",
        parameters: {
            type: 'object',
            properties: {},
            required: [],
            additionalProperties: false,
        },
        strict: true,
    },
    {
        type: 'function' as const,
        name: 'getCurrentWeather',
        description: 'Get the current weather for a specific location.',
        parameters: {
            type: 'object',
            properties: {
                location: {
                    type: 'string',
                    description: 'The city and state/country.',
                },
            },
            required: ['location'],
            additionalProperties: false,
        },
        strict: true,
    },
];
