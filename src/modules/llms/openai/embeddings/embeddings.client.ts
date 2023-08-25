import {Brand} from "~/common/brand";
import { useEmbeddingsStore } from './store-embeddings';
import { useModelsStore, useSourceSetup } from "~/modules/llms/store-llms";
import { DLLM, DModelSource, DModelSourceId } from '~/modules/llms/llm.types';

export const requireUserKeyEmbeddings = !process.env.HAS_SERVER_KEY_OPENAI_EMBEDDINGS;

export const isValidDatabaseUrl = (apiKey?: string) => !!apiKey /*&& apiKey.startsWith("redis")*/;

export const embeddingsDefaultIndex: string = 'index';

export const embeddingsDefaultDocCount: string = '1';

export const embeddingsDefaultChainType: string = '';

export async function callPublish(question: string, model: string): Promise<any | null> {
    /*const {
        source
    } = useSourceSetup(model,null);
    console.log(source)*/
    const {
        embeddingsApiKey: dbHost,
        embeddingsIndex: index,
        embeddingsDocs: docsCount,
        embeddingsChainType: chainType,
        modelTemperature: modelTemp
    } = useEmbeddingsStore.getState();
    try {
        const body = {
            to: "elastic.io",
            question: question,
            dbHost: dbHost,
            indexdb: index,
            docsCount: docsCount,
            openaiKey: 'source.oaiKey',
            modelTemp: modelTemp,
            origin: getOrigin(),
            model: model,
            chainType: chainType
        };

        // const response = await fetch('/api/publishPinecone', {
        const response = await fetch('/api/elastic/elastic', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body),
        });

        if (response.ok) {
            const res = await response.json();

            if (res.type === 'success') {
                // we log this to the console for extra safety
                console.log('Data from middleware', res);
                //return res.prompt
                return res
            }

            if (res.type === 'error')
                throw new Error(`Failed to send the req`);
        }

        throw new Error(`Failed to request db`);

    } catch (error) {
        console.error('Publish issue', error);
        alert(`Publish issue: ${error}`);
    }
    return null
}


/// Returns a pretty link to the current page, for promo
function getOrigin() {
    let origin = (typeof window !== 'undefined') ? window.location.href : '';
    if (!origin || origin.includes('//localhost'))
        origin = Brand.URIs.OpenRepo;
    origin = origin.replace('https://', '');
    if (origin.endsWith('/'))
        origin = origin.slice(0, -1);
    return origin;
}
