import { useUser } from '@auth0/nextjs-auth0/client';
import {Avatar, Box, Stack, Typography} from "@mui/joy";

export default function ProfileClient() {
    const { user, error, isLoading } = useUser();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>{error.message}</div>;

    const getUserObject = () => {
        return user;
    };
    //return user;
    return  (
        <Stack direction="row" spacing={1} alignSelf={"flex-end"} paddingRight={1} paddingTop={1}>
            <Avatar alt={user?.name} src={user?.picture} />
            <Box sx={{ flex: 1 }}>
                <Typography level="title-sm">{user?.name}</Typography>
                <Typography level="body-sm">{user?.email}</Typography>
            </Box>
        </Stack>
    )
}