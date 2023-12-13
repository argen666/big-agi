import {NextResponse} from 'next/server';
import {getSession, withApiAuthRequired} from '@auth0/nextjs-auth0';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import {NextApiResponse} from "next";

const email = process.env.APP_EMAIL
const password = process.env.APP_EMAIL_PASSWORD
const helpdesk = process.env.HELPDESK_EMAIL

export default withApiAuthRequired(async function emailRoute(req, res: NextApiResponse) {
//export default async function handler(req, res) {
    try {
        //const {invite_email} = await req.json();
        const {user} = await getSession(req, res);
        console.log(user.email)
        console.log(user.name)
        const invite_email = user.email
        const invite_name = user.name

        //return new NextResponse(JSON.stringify({"name":invite_name}));
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: email,
                pass: password,
            },
        });

        const mailOptions: Mail.Options = {
            from: email,
            to: helpdesk,
            subject: `LawLoom invitation request from ${invite_email} (${invite_name})`,
            text: `Please accept my invitation to ${invite_email}`,
        }

        const info = await transport.sendMail(mailOptions);

        //const mes = await sendMailPromise();
        const mes = info.messageId ? 'success' : 'fail'
        console.log(mes)

        const payload = {
            type: 'success',
            result: {message: mes}
        };
        res.status(200).json(payload);
        //return new NextResponse(JSON.stringify(payload));

    } catch (error) {
        console.error('email/publish error:', error);
        return new NextResponse(JSON.stringify({
            type: 'error',
            error: error?.toString() || 'Network issue',
        }), {status: 500});
    }
});

// noinspection JSUnusedGlobalSymbols
//export const runtime = 'edge';