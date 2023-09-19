import { Pipeline, pipeline, env } from "@xenova/transformers";
import {Embeddings, EmbeddingsParams} from "langchain/embeddings/base";
import path from 'path';
//import { chunkArray } from "langchain/dist/util/chunk.js";
//env.remoteHost = 'https://cashq-models.storage.googleapis.com'; //fixme move to config
env.allowRemoteModels = false;
env.cacheDir = path.join(process.cwd(), 'cache');
env.localModelPath = path.join(process.cwd(), 'models');
export interface HuggingFaceBgeEmbeddingsParams
    extends EmbeddingsParams {
    /** Model name to use */
    modelName: string;

    /**
     * Timeout to use when making requests to OpenAI.
     */
    timeout?: number;

    /**
     * The maximum number of documents to embed in a single request.
     */
    batchSize?: number;

    /**
     * Whether to strip new lines from the input text. This is recommended by
     * OpenAI, but may not be suitable for all use cases.
     */
    stripNewLines?: boolean;
}

export class HuggingFaceBgeEmbeddings
    extends Embeddings
    implements HuggingFaceBgeEmbeddingsParams
{
    modelName = "BAAI/bge-large-en";

    batchSize = 512;

    stripNewLines = true;

    timeout?: number;

    private pipelinePromise: Promise<Pipeline>;

    constructor(fields?: Partial<HuggingFaceBgeEmbeddingsParams>) {
        super(fields ?? {});
        this.modelName = fields?.modelName ?? this.modelName;
        this.stripNewLines = fields?.stripNewLines ?? this.stripNewLines;
        this.timeout = fields?.timeout;
    }

    async embedDocuments(texts: string[]): Promise<number[][]> {
        /*const batches = chunkArray(
            this.stripNewLines ? texts.map((t) => t.replace(/\n/g, " ")) : texts,
            this.batchSize
        );*/

        /*const batchRequests = batches.map((batch) => this.runEmbedding(batch));
        const batchResponses = await Promise.all(batchRequests);*/
        const embeddings: number[][] = [];

        /*for (let i = 0; i < batchResponses.length; i += 1) {
            const batchResponse = batchResponses[i];
            for (let j = 0; j < batchResponse.length; j += 1) {
                embeddings.push(batchResponse[j]);
            }
        }*/

        return embeddings;
    }

    async embedQuery(text: string): Promise<number[]> {
        const data = await this.runEmbedding([
            this.stripNewLines ? text.replace(/\n/g, " ") : text,
        ]);
        return data[0];
    }

    private async runEmbedding(texts: string[]) {
        const pipe = await (this.pipelinePromise ??= pipeline("feature-extraction", this.modelName));
        // const pipe = await (this.pipelinePromise ??= pipeline(
        //     "feature-extraction",
        //     this.modelName
        // ));

        return this.caller.call(async () => {
            const output = await pipe(texts, { pooling: "mean", normalize: true });
            return output.tolist();
        });
    }
}