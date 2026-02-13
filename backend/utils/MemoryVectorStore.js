import { VectorStore } from "@langchain/core/vectorstores";
import { Document } from "@langchain/core/documents";
import { cosineSimilarity } from "@langchain/core/utils/math";

export class MemoryVectorStore extends VectorStore {
    constructor(embeddings, args = {}) {
        super(embeddings, args);
        this.memoryVectors = [];
    }

    _vectorstoreType() {
        return "memory";
    }

    async addDocuments(documents) {
        const texts = documents.map(({ pageContent }) => pageContent);
        const vectors = await this.embeddings.embedDocuments(texts);

        // Create new vectors and add to memory
        const newVectors = documents.map((doc, i) => ({
            content: doc.pageContent,
            metadata: doc.metadata,
            embedding: vectors[i]
        }));

        this.memoryVectors.push(...newVectors);
    }

    async similaritySearchVectorWithScore(query, k, filter) {
        if (this.memoryVectors.length === 0) {
            return [];
        }

        // In naive implementation, we just compute cosine similarity against all docs
        // query is a number[]
        // this.memoryVectors[i].embedding is a number[]

        // To optimize slightly, we can pass arrays of vectors if cosineSimilarity supports it
        // But let's check one by one or create matrix if math util supports matrix ops.
        // Usually cosineSimilarity takes matrix X and matrix Y.

        const embeddingsMatrix = this.memoryVectors.map(v => v.embedding);
        const queryMatrix = [query];

        const similarities = cosineSimilarity(queryMatrix, embeddingsMatrix)[0];
        // similarities is array of scores matching embeddingsMatrix indices

        const searches = similarities.map((score, index) => ({
            score,
            index
        }));

        searches.sort((a, b) => b.score - a.score);

        const result = searches.slice(0, k).map(search => {
            const doc = this.memoryVectors[search.index];
            return [
                new Document({
                    pageContent: doc.content,
                    metadata: doc.metadata,
                }),
                search.score,
            ];
        });

        return result;
    }

    static async fromTexts(texts, metadatas, embeddings, dbConfig) {
        const docs = [];
        for (let i = 0; i < texts.length; i += 1) {
            const metadata = Array.isArray(metadatas) ? metadatas[i] : metadatas;
            const newDoc = new Document({
                pageContent: texts[i],
                metadata,
            });
            docs.push(newDoc);
        }
        const store = new this(embeddings, dbConfig);
        await store.addDocuments(docs);
        return store;
    }

    static async fromDocuments(docs, embeddings, dbConfig) {
        const store = new this(embeddings, dbConfig);
        await store.addDocuments(docs);
        return store;
    }
}
