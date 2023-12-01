import * as React from 'react';

import {AppChat} from '../src/apps/chat/AppChat';

import {AppLayout} from '~/common/layout/AppLayout';
import {checkInvitationList} from "../src/apps/news/invite.hooks";


export default function ChatPage() {
    // show the News page on updates
    //useShowNewsOnUpdate();

    let res = checkInvitationList();
    //let res = true;
    if (res) {
        return (
            <AppLayout>
                <AppChat/>
            </AppLayout>
        );
     } else return (
             <div>Loading...</div>
     );
}