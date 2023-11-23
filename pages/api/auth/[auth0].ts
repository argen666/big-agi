// app/api/auth/[auth0]/route.js
import { handleAuth,handleLogout } from '@auth0/nextjs-auth0';

//export const GET = handleAuth();
//export default handleAuth();
export default handleAuth(/*{
    logout: handleLogout({ returnTo: 'https://example.com' })
}*/);