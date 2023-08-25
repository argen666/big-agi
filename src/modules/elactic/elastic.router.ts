import {createTRPCRouter, publicProcedure} from '~/modules/trpc/trpc.server';
import {OpenAIEmbeddings} from "langchain/embeddings/openai";
import {Client, ClientOptions} from "@elastic/elasticsearch";
import {ElasticClientArgs, ElasticVectorSearch} from "langchain/vectorstores/elasticsearch";
import {z} from "zod";
import {useEmbeddingsStore} from "~/modules/llms/openai/embeddings/store-embeddings";
import {Document as LDocument} from "langchain/document";

const searchDocsInputSchema = z.object({
    question: z.string(),
    dbHost: z.string(),
    indexdb: z.string(),
    docsCount: z.string(),
    chainType: z.string().nullable(),
    openAIKey: z.string(),
});

const searchDocsInputSchema2 = z.object({
    question: z.string(),
});

const searchDocsOutputSchema = z.object({
    type: z.string(),
    chainType: z.string().nullable(),
    result: z.string().nullable(),
    resultDocs: z.string().nullable(),
});

export const elasticRouter = createTRPCRouter({
    searchDocs: publicProcedure
        .input(searchDocsInputSchema)
        //.input(z.string())
        .query(async ({input}) => {
            console.log(input);
            //console.log(question);

            const res = await callElastic(input);
            if (res.type === 'success') {
               return res;
            }

            if (res.type === 'error')
                throw new Error(`Failed to send the req`);

        }),
});


export function elevenlabsAccess(elevenKey: string | undefined, apiPath: string): { headers: HeadersInit, url: string } {
    // API key
    elevenKey = (elevenKey || process.env.ELEVENLABS_API_KEY || '').trim();
    if (!elevenKey)
        throw new Error('Missing ElevenLabs API key.');

    // API host
    let host = (process.env.ELEVENLABS_API_HOST || 'api.elevenlabs.io').trim();
    if (!host.startsWith('http'))
        host = `https://${host}`;
    if (host.endsWith('/') && apiPath.startsWith('/'))
        host = host.slice(0, -1);

    return {
        headers: {
            'Content-Type': 'application/json',
            'xi-api-key': elevenKey,
        },
        url: host + apiPath,
    };
}

async function callElastic(input) {
    try {
        const {question,dbHost,indexdb,docsCount,chainType,openAIKey} = input;

        if (!question)
            throw new Error('Invalid options');
        const index = !indexdb ? "index" : indexdb
        let defaultPrompt: string = "Use the following pieces of context to answer the users question. \n If you don't know the answer, just say that you don't know, don't try to make up an answer.\n----------------\n";

        const embeddings = new OpenAIEmbeddings({
            openAIApiKey: openAIKey//fixme!!!!
        });

        const config: ClientOptions = {
            node: dbHost,
        };
        const clientArgs: ElasticClientArgs = {
            client: new Client(config),
            indexName: index,
        };

        //const pineconeIndex = client.Index(index);
        // const docsearch = await PineconeStore.fromExistingIndex(embeddings, {pineconeIndex});

        const docsearch = await ElasticVectorSearch.fromExistingIndex(embeddings, clientArgs);
        const docs = await similaritySearch(embeddings,clientArgs, question, docsCount);
        let result: string = ""
        let resultDocs: any = ""
        if (chainType && chainType !== "" && chainType !== "none") {
            /* let llm = new ChatOpenAI({modelName:model, streaming:false, temperature:modelTemp, openAIApiKey:openaiKey});
             let chain = loadQAChain(llm, {type:chainType});
             let res = await chain.call({
                 input_documents: docs,
                 question: question,
             });
             result = res.text;*************/
            resultDocs = docs;
        } else {
            //result = docs.map(doc => doc.pageContent).join("\\n\\n");
            result = docs.map(doc => JSON.stringify(doc, null, 2)).join("\n\n");
            result = defaultPrompt + result;
        }
        const payload = {
            type: 'success',
            //url: `https://paste.gg/${paste.result.id}`,
            //expires: paste.result.expires || 'never',
            chainType: chainType,
            result: result,
            resultDocs: resultDocs,
        };
        return (payload);

    } catch (error) {
        console.error('api/publish error:', error);
        return ({
            type: 'error',
            error: error?.toString() || 'Network issue',
        });
    }
}

async function similaritySearch(embeddings,clientArgs,
    query: string,
    k = 4,
): Promise<LDocument[]> {
    const results = await similaritySearchVectorWithScore(
        await embeddings.embedQuery(query),clientArgs,
        k,
    );

    return results.map((result) => result[0]);
}

async function similaritySearchVectorWithScore(
    query: number[],clientArgs: ElasticClientArgs,
    k: number,
): Promise<[LDocument, number][]> {
    const qorig = {
        index: clientArgs.indexName,
        size: k,
        knn: {
            field: "vector",
            query_vector: query,
            //filter: this.buildMetadataTerms(filter),
            k,
            num_candidates: 200,
        },
    };
    //const q = {script_score: {query: {match_all: {}}, script: {source: "cosineSimilarity(params.query_vector, 'vector') + 1.0", params: {query_vector: query}}}};
    const q = {'query': {'script_score': {'query': {'match_all': {}}, 'script': {'source': "cosineSimilarity(params.query_vector, 'vector') + 1.0", 'params': {'query_vector': query}}}}, 'size': k};
    const result = await clientArgs.client.search(q);
    console.log(result)

    return result.hits.hits.map((hit: any) => [
        new LDocument({
            pageContent: hit._source.text,
            metadata: hit._source.metadata,
        }),
        hit._score,
    ]);
}