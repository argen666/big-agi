import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {HuggingFaceBgeEmbeddings} from "~/modules/llms/openai/embeddings/bge";
import {env, pipeline} from "@xenova/transformers";


interface EmbeddingsStore {

    embeddingsApiKey: string;
    setEmbeddingsApiKey: (apiKey: string) => void;

    embeddingsIndex: string;
    setEmbeddingsIndex: (index: string) => void;

    embeddingsDocs: number;
    setEmbeddingsDocs: (docs: number) => void;

    embeddingsChainType: string;
    setEmbeddingsChainType: (index: string) => void;

    embeddingsModel: string;
    setEmbeddingsModel: (index: string) => void;

}

export const useEmbeddingsStore = create<EmbeddingsStore>()(
  persist(
    (set) => ({

        embeddingsApiKey: '',
        setEmbeddingsApiKey: (val: string) => set({embeddingsApiKey: val}),

        embeddingsIndex: 'index',
        setEmbeddingsIndex: (val: string) => set({embeddingsIndex: val}),

        embeddingsDocs: 1,
        setEmbeddingsDocs: (val: number) => set({embeddingsDocs: val}),

        embeddingsChainType: '',
        setEmbeddingsChainType: (val: string) => set({embeddingsChainType: val}),

        embeddingsModel: 'openai',
        setEmbeddingsModel: (val: string) => {
            /*if (val === 'bge-large-en') {
                env.remoteHost = 'https://cashq-models.storage.googleapis.com'; //fixme move to config
                const pipe = pipeline("feature-extraction", "BAAI/bge-large-en");
            }*/
            set({embeddingsModel: val})
        },

    }),
    {
      name: 'app-module-embeddings',
    }),
);