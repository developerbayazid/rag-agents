import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export async function splitDocument(document: string) {
    const response = await fetch(document);
    const text = await response.text();
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 150,
        chunkOverlap: 15,
    });
    const output = await splitter.createDocuments([text]);
    return output;
}
