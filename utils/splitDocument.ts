import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { readFileSync } from 'fs';
import path from 'path';

export async function splitDocument(fileName: string) {
    const filePath = path.join(
        process.cwd(),
        'public',
        'rag_documents',
        fileName,
    );

    const text = readFileSync(filePath, 'utf8');

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 150,
        chunkOverlap: 15,
    });

    const output = await splitter.createDocuments([text]);

    return output;
}
