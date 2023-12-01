import * as React from 'react';
import {useRouter} from 'next/router';

import {useAppStateStore} from '~/common/state/store-appstate';

import {incrementalVersion} from './news.data';
import {useUser} from "@auth0/nextjs-auth0/client";

const adminList = ["alex@mycashq.com", "igor@mycashq.com"]
const invitations = [""]
const invitationList = [...adminList, ...invitations]

export function checkInvitationList() {
    const {push} = useRouter();
    const {user, error, isLoading} = useUser();
    if (isLoading) return false;
    if (error) return false;
    //console.log("User:"+JSON.stringify(user))
    const isUserInvited = invitationList.includes(user.email);
    if (!isUserInvited) {
        React.useEffect(() => {
            // Disable for now
            //push(`/invite?email=${encodeURIComponent(user.email)}`).then(() => null);
            push({
                pathname: '/invite',
                //query: { email: user.email },
            })
        }, [push, user]);
    } else {
        React.useEffect(() => {
        localStorage.removeItem('app-models');
        }, []);
        return true
    }
    return false;
}

export function useMarkNewsAsSeen() {
    React.useEffect(() => {
        useAppStateStore.getState().setLastSeenNewsVersion(incrementalVersion);
    }, []);
}