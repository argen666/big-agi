import * as React from 'react';

import { AppLayout } from '~/common/layout/AppLayout';
import {Box, Button, Card, CardContent, Container, IconButton, Typography} from "@mui/joy";
import {Link} from "~/common/components/Link";
import {useRouter} from "next/router";



export default function InvitePage() {
  // update the last seen news version
  //useMarkNewsAsSeen();
    //const { router } = useRouter();
    //console.log("><><@"+router)
    // const email = searchParams.get('email')
    // console.log("><><"+email)
    const helpEmail = 'help@mycashq.com'
    const subject = encodeURIComponent('Invitation Request');
    const body = encodeURIComponent('I would like to request an invitation to LawLoom.');
  return (
    <AppLayout suspendAutoModelsSetup>
        <Box sx={{
            backgroundColor: 'background.level1',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            flexGrow: 1,
            overflowY: 'auto',
            minHeight: 96,
            p: { xs: 3, md: 6 },
            gap: 4,
        }}>

            <Typography level='h1' sx={{fontSize: '3.6rem'}}>
                Welcome to LawLoom!
            </Typography>

            <Typography>
                LawLoom is now invitation-only. Want to join us? Click below to request your invitation.
            </Typography>

            <Button variant='solid' color='neutral' size='lg' component={Link} href={`mailto:${helpEmail}?subject=${subject}&body=${body}`} noLinkStyle>
                Request invite
            </Button>


        </Box>
    </AppLayout>
  );
}