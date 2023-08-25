// import {NextRequest, NextResponse} from 'next/server';
// import {OpenAIEmbeddings} from "langchain/embeddings/openai";
// import {
//     ElasticClientArgs,
//     ElasticVectorSearch,
// } from "langchain/vectorstores/elasticsearch";
// import {Client, ClientOptions} from "@elastic/elasticsearch";
//
// export default async function handler(req: NextRequest) {
//
//     try {
//         const {to, question, dbHost, indexdb, docsCount, openaiKey, origin, model, chainType, modelTemp} = await req.json();
//         if (req.method !== 'POST' || to !== 'elastic.io' || !question)
//             throw new Error('Invalid options');
//         const index = !indexdb ? "index" : indexdb
//         let defaultPrompt: string = "Use the following pieces of context to answer the users question. \\nIf you don't know the answer, just say that you don't know, don't try to make up an answer.\\n----------------\\n";
//
//         const embeddings = new OpenAIEmbeddings({
//             openAIApiKey: openaiKey
//         });
//
//         const config: ClientOptions = {
//             node: dbHost,
//         };
//         const clientArgs: ElasticClientArgs = {
//             client: new Client(config),
//             indexName: index,
//         };
//
//         //const pineconeIndex = client.Index(index);
//         // const docsearch = await PineconeStore.fromExistingIndex(embeddings, {pineconeIndex});
//
//         const docsearch = await ElasticVectorSearch.fromExistingIndex(embeddings, clientArgs);
//         const docs = await docsearch.similaritySearch(question, docsCount);
//         let result: string = ""
//         let resultDocs: any = ""
//         if (chainType && chainType!=="" && chainType!=="none") {
//            /* let llm = new ChatOpenAI({modelName:model, streaming:false, temperature:modelTemp, openAIApiKey:openaiKey});
//             let chain = loadQAChain(llm, {type:chainType});
//             let res = await chain.call({
//                 input_documents: docs,
//                 question: question,
//             });
//             result = res.text;*/
//             resultDocs = docs;
//         } else {
//             result = docs.map(doc => doc.pageContent).join("\\n\\n");
//             result = defaultPrompt + result;
//         }
//         const payload = {
//             type: 'success',
//             //url: `https://paste.gg/${paste.result.id}`,
//             //expires: paste.result.expires || 'never',
//             chainType: chainType,
//             result: result,
//             resultDocs: resultDocs,
//         };
//         return new NextResponse(JSON.stringify(payload));
//
//     } catch (error) {
//         console.error('api/publish error:', error);
//         return new NextResponse(JSON.stringify({
//             type: 'error',
//             error: error?.toString() || 'Network issue',
//         }), {status: 500});
//     }
// }
//
// // noinspection JSUnusedGlobalSymbols
// export const config = {
//     runtime: 'edge',
// };