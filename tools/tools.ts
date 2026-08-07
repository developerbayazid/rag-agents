export async function getCurrentWeather(): Promise<string> {
    const weather = {
        temperature: '72',
        unit: 'F',
        forecast: 'sunny',
    };
    return JSON.stringify(weather);
}

export async function getLocation(): Promise<string> {
    return 'Salt Lake City, UT';
}
