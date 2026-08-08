export async function getCoordinates(location: string) {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');

    url.searchParams.set('name', location);
    url.searchParams.set('count', '1');
    url.searchParams.set('language', 'en');
    url.searchParams.set('format', 'json');

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Failed to find location');
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error(`Location not found: ${location}`);
    }

    return {
        latitude: data.results[0].latitude,
        longitude: data.results[0].longitude,
        name: data.results[0].name,
        country: data.results[0].country,
    };
}

export async function getCurrentWeather(location: string): Promise<string> {
    const coordinates = await getCoordinates(location);

    const url = new URL('https://api.open-meteo.com/v1/forecast');

    url.searchParams.set('latitude', coordinates.latitude.toString());

    url.searchParams.set('longitude', coordinates.longitude.toString());

    url.searchParams.set(
        'current',
        'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
    );

    url.searchParams.set('timezone', 'auto');

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Failed to fetch weather');
    }

    const data = await response.json();

    return JSON.stringify({
        location: `${coordinates.name}, ${coordinates.country}`,
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        apparentTemperature: data.current.apparent_temperature,
        windSpeed: data.current.wind_speed_10m,
        weatherCode: data.current.weather_code,
        unit: data.current_units.temperature_2m,
    });
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
