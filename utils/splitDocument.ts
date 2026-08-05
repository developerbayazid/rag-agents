import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { readFileSync } from 'fs';
import path from 'path';

export async function splitDocument(fileName: string) {
    try {
        const filePath = path.join(
            process.cwd(),
            'public',
            'rag_documents',
            fileName,
        );

        if (!filePath) {
            throw new Error('Please provide a valid file path and name');
        }

        const text = readFileSync(filePath, 'utf8');

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 250,
            chunkOverlap: 30,
        });

        const output = await splitter.createDocuments([text]);

        return output;
    } catch (error) {
        console.error(error);
    }
}
