import {DLLMId} from '~/modules/llms/llm.types';
import {SystemPurposeId, SystemPurposes} from '../../../data';
import {createDMessage, DMessage, useChatStore} from '~/common/state/store-chats';

import {speakText} from '~/modules/elevenlabs/elevenlabs.client';
import {useEmbeddingsStore} from '~/modules/llms/openai/embeddings/store-embeddings';

import {autoTitle} from '~/modules/aifn/autotitle/autoTitle';
import {createAssistantTypingMessage} from './editors';
import {useElevenlabsStore} from "~/modules/elevenlabs/store-elevenlabs";
import {findLLMOrThrow, streamChat} from "~/modules/llms/llm.client";
//import { ChatOpenAI } from "langchain/chat_models/openai";
//import { loadQAChain } from "langchain/chains";
//import {callElastic} from "~/modules/elastic/elastic.client";
import {apiAsync} from '~/modules/trpc/trpc.client';
import {Simulate} from "react-dom/test-utils";
import {ModelVendorOpenAI, SourceSetupOpenAI} from "~/modules/llms/openai/openai.vendor";


/**
 * The main "chat" function. TODO: this is here so we can soon move it to the data model.
 */
//export async function runAssistantUpdatingState(conversationId: string, history: DMessage[], assistantLlmId: DLLMId, systemPurpose: SystemPurposeId, _autoTitle: boolean, _autoSuggestions: boolean) {
export async function runEmbeddingsUpdatingState(conversationId: string, history: DMessage[], question: string, assistantModel: DLLMId, systemPurpose: SystemPurposeId) {
    const {embeddingsChainType: chainType, modelTemperature: modelTemp} = useEmbeddingsStore.getState();
    let assistantMessageId = ""
    //if (chainType && chainType !== "" && chainType !== "none") {
    //}
    history = updatePurposeInHistory(conversationId, history, null, systemPurpose);
    assistantMessageId = createAssistantTypingMessage(conversationId, assistantModel, history[0].purposeId, '...');
    const controller = new AbortController();
    const {startTyping, editMessage} = useChatStore.getState();
    startTyping(conversationId, controller);
    // update the system message from the active Purpose, if not manually edited
    const response = await getResultWithEmbeddings(question, assistantModel)
    if (response && response?.chainType !== "" && response?.chainType !== "none") {
        /* const resultDocs = response.resultDocs;

         //----------
         let llm = new ChatOpenAI({modelName:assistantModel, streaming:false, temperature:modelTemp, openAIApiKey:getOpenAISettings().apiKey});
         let chain = loadQAChain(llm, {type:chainType as any});
         let res = await chain.call({
             input_documents: resultDocs,
             question: question,
         });
         const resultMessage = res.text;
         //----------
         //console.log(resultMessage)
         //assistantMessageId = createAssistantTypingMessage(conversationId, assistantModel, history[0].purposeId, '...');
         // when an abort controller is set, the UI switches to the "stop" mode
         const controller = new AbortController();
         const {startTyping, editMessage} = useChatStore.getState();
         startTyping(conversationId, controller);

         await streamChainAssistantMessage(conversationId, assistantMessageId, history, assistantModel, editMessage, resultMessage);

         // clear to send, again
         startTyping(conversationId, null);

         // update text, if needed
         await autoTitle(conversationId);*/
    } else {
        const systemMessage = response.result;
        history = updatePurposeInHistory(conversationId, history, systemMessage, systemPurpose);

        // create a blank and 'typing' message for the assistant
        const assistantMessageId = createAssistantTypingMessage(conversationId, assistantModel, history[0].purposeId, '...');

        // when an abort controller is set, the UI switches to the "stop" mode
        const controller = new AbortController();
        const {startTyping, editMessage} = useChatStore.getState();
        startTyping(conversationId, controller);

        //await streamAssistantMessage(conversationId, assistantMessageId, history, assistantModel, editMessage, controller.signal);
        await streamAssistantMessage(assistantModel, history, controller.signal, (updatedMessage) =>
            editMessage(conversationId, assistantMessageId, updatedMessage, false));

        // clear to send, again
        startTyping(conversationId, null);

        // update text, if needed
        await autoTitle(conversationId);
    }

}


async function getResultWithEmbeddings(question: string, model: string) {
    //const docsString = await callPublish(question, model)
    const {
        embeddingsApiKey: dbHost,
        embeddingsIndex: indexdb,
        embeddingsDocs: docsCount,
        embeddingsChainType: chainType,
        modelTemperature: modelTemp
    } = useEmbeddingsStore.getState();

    const llm = findLLMOrThrow(model);
    const openAISetup = ModelVendorOpenAI.normalizeSetup(llm._source.setup as Partial<SourceSetupOpenAI>);
    // console.log(openAISetup)
    const docsString = apiAsync.elastic.searchDocs.query({
        question: question,
        dbHost: dbHost,
        indexdb: indexdb,
        docsCount: docsCount,
        chainType: chainType,
        openAIKey: openAISetup.oaiKey
    });
    console.log(docsString)
    return docsString
}

export function updatePurposeInHistory(conversationId: string, history: DMessage[], systemMessageNew: string | null, purposeId: SystemPurposeId): DMessage[] {
    const systemMessageIndex = history.findIndex(m => m.role === 'system');
    const systemMessage: DMessage = systemMessageIndex >= 0 ? history.splice(systemMessageIndex, 1)[0] : createDMessage('system', '');
    if (!systemMessage.updated && purposeId && SystemPurposes[purposeId]?.systemMessage) {
        systemMessage.purposeId = purposeId;
        systemMessage.text = systemMessageNew ? systemMessageNew : SystemPurposes[purposeId].systemMessage.replaceAll('{{Today}}', new Date().toISOString().split('T')[0]);
    }
    history.unshift(systemMessage);
    useChatStore.getState().setMessages(conversationId, history);
    return history;
}

// export function createAssistantTypingMessage(conversationId: string, assistantModel: DLLMId | 'prodia' | 'react-...', assistantPurposeId: SystemPurposeId | undefined, text: string): string {
//     const assistantMessage: DMessage = createDMessage('assistant', text);
//     assistantMessage.typing = true;
//     assistantMessage.purposeId = assistantPurposeId;
//     assistantMessage.originLLM = assistantModel;
//     useChatStore.getState().appendMessage(conversationId, assistantMessage);
//     return assistantMessage.id;
// }


/**
 * Main function to send the chat to the assistant and receive a response (streaming)
 */
async function streamAssistantMessage(
    llmId: DLLMId, history: DMessage[],
    abortSignal: AbortSignal,
    editMessage: (updatedMessage: Partial<DMessage>) => void,
) {

    // 📢 TTS: speak the first line, if configured
    const speakFirstLine = useElevenlabsStore.getState().elevenLabsAutoSpeak === 'firstLine';
    let firstLineSpoken = false;

    try {
        const messages = history.map(({role, text}) => ({role, content: text}));
        await streamChat(llmId, messages, abortSignal, (updatedMessage: Partial<DMessage>) => {
            // update the message in the store (and thus schedule a re-render)
            editMessage(updatedMessage);

            // 📢 TTS
            if (updatedMessage?.text && speakFirstLine && !firstLineSpoken) {
                let cutPoint = updatedMessage.text.lastIndexOf('\n');
                if (cutPoint < 0)
                    cutPoint = updatedMessage.text.lastIndexOf('. ');
                if (cutPoint > 100 && cutPoint < 400) {
                    firstLineSpoken = true;
                    const firstParagraph = updatedMessage.text.substring(0, cutPoint);
                    speakText(firstParagraph).then(() => false /* fire and forget, we don't want to stall this loop */);
                }
            }
        });
    } catch (error: any) {
        if (error?.name !== 'AbortError') {
            console.error('Fetch request error:', error);
            // TODO: show an error to the UI?
        }
    }

    // finally, stop the typing animation
    editMessage({typing: false});
}

//LangChain
async function streamChainAssistantMessage(
    conversationId: string, assistantMessageId: string, history: DMessage[],
    chatModelId: string,
    editMessage: (conversationId: string, messageId: string, updatedMessage: Partial<DMessage>, touch: boolean) => void,
    resultMessage: string,
) {

    const {modelTemperature, modelMaxResponseTokens, elevenLabsAutoSpeak} = useEmbeddingsStore.getState();
    try {
        if (resultMessage) {

            editMessage(conversationId, assistantMessageId, {originLLM: chatModelId}, false);
            speakText(resultMessage).then(() => false /* fire and forget, we don't want to stall this loop */);
            editMessage(conversationId, assistantMessageId, {text: resultMessage}, false);
        }

    } catch (error: any) {
        if (error?.name === 'AbortError') {
            // expected, the user clicked the "stop" button
        } else {
            // TODO: show an error to the UI
            console.error('Fetch request error:', error);
        }
    }

    // finally, stop the typing animation
    editMessage(conversationId, assistantMessageId, {typing: false}, false);
}