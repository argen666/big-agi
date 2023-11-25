import {NextRequest, NextResponse} from 'next/server';
//import { get_encoding } from "tiktoken";
import { getEncoding, encodingForModel } from "js-tiktoken";
import {getSession, withApiAuthRequired} from '@auth0/nextjs-auth0/edge';
//import { PrismaClient } from '@prisma/client/edge'
//const prisma = new PrismaClient();
const databaseUrl = process.env.DATABASE_URL

export default withApiAuthRequired(async function myApiRoute(req, res) {
//export default async function handler(req, res) {

    try {
        const {request_payload, request, response} = await req.json();
        const { user } = await getSession(req, res);
        console.log(user.email)
        console.log(user.name)
        console.log("LLM Tokens: "+calculateTokens(""+request+response))
        console.log("LLM Messages: ")
        console.dir(request, {depth: null})
        console.log("LLM response: ")
        console.dir(response, {depth: null})
        const tkn = calculateTokens(""+request+response);
        const data = {
            email: user.email,
            name: user.name,
            request:request,
            request_payload:request_payload,
            response:response,
            tokens: tkn,
        }
        // const all = await prisma.logs.findMany();
        // console.log(all)
        // const result = await prisma.logs.create({
        //     data: {
        //         ...data,
        //     },
        // });
        const pld = {
            fields:{
                email: user.email,
                name: user.name,
                request:JSON.stringify(request),
                request_payload:JSON.stringify(request_payload),
                response:JSON.stringify(response),
                tokens: tkn,
            }
        }
        console.log(pld)
        console.log(databaseUrl)
        const result = await fetch(databaseUrl+'/api/tables/logs/rows', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pld) });
        await throwResponseNotOk(result)
        //console.log(result)
        const payload = {
            type: 'success',
            result: JSON.stringify(result)
        };
        return new NextResponse(JSON.stringify(payload));

    } catch (error) {
        console.error('log/publish error:', error);
        return new NextResponse(JSON.stringify({
            type: 'error',
            error: error?.toString() || 'Network issue',
        }), {status: 500});
    }
});

function calculateTokens(str) {
    const encoding = getEncoding("cl100k_base");
    const tokens = encoding.encode(str);
    const len = tokens.length;
    return len
}

async function throwResponseNotOk(response: Response) {
    if (!response.ok) {
        const errorPayload: object | null = await response.json().catch(() => null);
        throw new Error(`${response.status} · ${response.statusText}${errorPayload ? ' · ' + JSON.stringify(errorPayload) : ''}`);
    }
}
// noinspection JSUnusedGlobalSymbols
export const runtime = 'edge';