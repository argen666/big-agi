import * as React from 'react';
import {useState} from 'react';

import {AppLayout} from '~/common/layout/AppLayout';
import {Box, Button, Typography} from "@mui/joy";


export default function InvitePage() {
    const [message, setMessage] = useState('');
    const [emailSent, setEmailSent] = useState(false);

    const sendEmail = async () => {
        try {
            const res = await fetch('/api/email/email', {method: 'POST', body: JSON.stringify({})});
            if (res.ok) {
                const data = await res.json();
                console.log(data);
                if (data.type === 'success') {
                    setMessage('Invite successfully requested!');
                    setEmailSent(true);
                } else {
                    setMessage('Error sending invitation request. Please try again later');
                }
            } else {
                setMessage('Error sending invitation request. Please try again later');
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <AppLayout suspendAutoModelsSetup>
            <Box sx={{
                backgroundColor: 'background.level1',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                flexGrow: 1,
                overflowY: 'auto',
                minHeight: 96,
                p: {xs: 3, md: 6},
                gap: 4,
            }}>

                <Typography level='h1' sx={{fontSize: '3.6rem'}}>
                    Welcome to LawLoom!
                </Typography>

                <Typography>
                    LawLoom is now invitation-only. Want to join us? Click below to request your invitation.
                </Typography>

                {/*<Button variant='solid' color='neutral' size='lg' component={Link} href={`mailto:${helpEmail}?subject=${subject}&body=${body}`} noLinkStyle>*/}
                {/*    Request invite*/}
                {/*</Button>*/}

                {message && <p>{message}</p>}

                {!emailSent &&
                <Button variant='solid' color='neutral' size='lg' onClick={sendEmail} noLinkStyle>
                    Request invite
                </Button>
                }


            </Box>
        </AppLayout>
    );
}