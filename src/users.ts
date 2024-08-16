export type Email = string;

export const AdminList: Email[] = ["alex@mycashq.com", "igor@mycashq.com",];
export const InvitationsList: Email[] = [
    "igor@b-platform.io",
    "alex@b-platform.io",
    "arina@mycashq.com",
    "Robin.Garrison@firstbankonline.com",
    "lorenzo@corisma.net",
    "evan@kiddiekredit.com",
    "krbahr@gmail.com",
    "santosbarrio@letsbit.io",
    "vadim@paperstack.us",
    "etendraverma2501@gmail.com",
    "alexander.easdale@pluralstrategy.com",
    "SpeakerinfoCMS@gmail.com",
    "sytaylor0@gmail.com",
    "nader@moneyhash.io",
    "natalia@nklawgroup.com",
    "od@zuger-see.com",
    "micaelac.romero@gmail.com"
];

export function isAdmin(userEmail) {
    return AdminList.includes(userEmail);
}

export function isInvited(userEmail) {
    const invitations = [...AdminList, ...InvitationsList]
    return invitations.includes(userEmail);
}