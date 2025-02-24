import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: '1044869358456-q12gb9smrld4f3srank4457b3akm9jfe.apps.googleusercontent.com',
      clientSecret: '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',
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub;
      return session;
    },
  },
});