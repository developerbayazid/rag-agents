import { openai } from '@/lib/openai';
import { getCurrentWeather, getLocation } from '@/tools/tools';
import { ResponseInput } from 'openai/resources/responses/responses';

/**
 * Goal - build an agent that can answer any questions that might require knowledge about my current location and the current weather at my location.
 */

/**
     PLAN:
        1. Design a well-written ReAct prompt
        2. Build a loop for my agent to run in.
        3. Parse any actions that the LLM determines are necessary
        4. End condition - final Answer is given

*/

const availableFunctions: Record<string, (arg: string) => Promise<string>> = {
    getCurrentWeather,
    getLocation,
};

export async function weatherAgent(query: string) {
    const systemPrompt = `
        You cycle through Thought, Action, PAUSE, Observation. At the end of the loop you output a final Answer. Your final answer should be highly specific to the observations you have from running
        the actions.
        1. Thought: Describe your thoughts about the question you have been asked.
        2. Action: run one of the actions available to you - then return PAUSE.
        3. PAUSE
        4. Observation: will be the result of running those actions.

        Available actions:
        - getCurrentWeather: 
            E.g. getCurrentWeather: Salt Lake City
            Returns the current weather of the location specified.
        - getLocation:
            E.g. getLocation: null
            Returns user's location details. No arguments needed.

        Example session:
        Question: Please give me some ideas for activities to do this afternoon.
        Thought: I should look up the user's location so I can give location-specific activity ideas.
        Action: getLocation: null
        PAUSE

        You will be called again with something like this:
        Observation: "New York City, NY"

        Then you loop again:
        Thought: To get even more specific activity ideas, I should get the current weather at the user's location.
        Action: getCurrentWeather: New York City
        PAUSE

        You'll then be called again with something like this:
        Observation: { location: "New York City, NY", forecast: ["sunny"] }

        You then output:
        Answer: <Suggested activities based on sunny weather that are highly specific to New York City and surrounding areas.>
    `;

    const input: ResponseInput = [
        {
            role: 'developer',
            content: systemPrompt,
        },
        {
            role: 'user',
            content: query,
        },
    ];

    const logs: string[] = [];

    const MAX_ITERATIONS = 5;

    const actionRegex = /^Action: (\w+): (.*)$/;

    for (let i = 0; i < MAX_ITERATIONS; i++) {
        console.log(`Iteration: ${i + 1}`);

        const response = await openai.responses.create({
            model: 'gpt-5-mini',
            input,
            reasoning: {
                effort: 'low',
            },
        });

        /**
         * PLAN:
         * 1. Split the string on the newline character \n
         * 2. Search through the array of strings for one that has "Action:"
         * 3. Parse the action (function and parameter) from the string
         * 4. Calling the function
         * 5. Add an "Obversation" message with the results of the function call
         */

        const responseText = response.output_text;
        logs.push(responseText);
        input.push({ role: 'assistant', content: responseText });

        const responseLine = responseText.split('\n');

        const foundActionStr = responseLine.find((str) =>
            actionRegex.test(str),
        );

        if (foundActionStr) {
            const actions = actionRegex['exec'](foundActionStr ?? '');

            const [_, action, actionArg] = actions ?? [];

            if (!availableFunctions.hasOwnProperty(action)) {
                throw new Error(`Unknown action: ${action}: ${actionArg}`);
            }

            logs.push(`Calling function ${action} with argument ${actionArg}`);

            const observation = await availableFunctions[action](actionArg);

            input.push({
                role: 'assistant',
                content: `Observation: ${observation}`,
            });
        } else {
            logs.push('Agent finished with task');
            return {
                logs,
                responseText,
            };
        }
    }
}
