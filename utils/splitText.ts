import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export async function splitText(text: string) {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 150,
        chunkOverlap: 15,
    });

    return splitter.createDocuments([text]);
}
