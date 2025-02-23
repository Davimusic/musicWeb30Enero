import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export default NextAuth({
    providers: [
        GoogleProvider({
            clientId: '1044869358456-1ct5vhsknmcn7v6km1m1o73q2lf1k489.apps.googleusercontent.com',
            clientSecret: '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'
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            console.log('signIn callback', { user, account, profile });
            return true; // Indica si la autenticación fue exitosa
        },
        async redirect({ url, baseUrl }) {
            console.log('redirect callback', { url, baseUrl });
            return baseUrl;
        },
        async session({ session, token }) {
            console.log('session callback', { session, token });
            session.user.id = token.sub;
            return session;
        },
        async jwt({ token, user, account, profile }) {
            console.log('jwt callback', { token, user, account, profile });
            if (account) {
                token.id = account.id;
            }
            return token;
        }
    },
    pages: {
        signIn: '/auth/signin', // Página personalizada de inicio de sesión
        error: '/auth/error' // Página de error personalizada
    },
    secret: 'tu-secreto-nextauth'
});









