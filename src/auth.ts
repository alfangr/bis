import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

const DEFAULT_ADMIN_EMAILS = ['alfangr05@gmail.com'];

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : DEFAULT_ADMIN_EMAILS)
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: 'jwt' },
  callbacks: {
    // Only lets a session get created for an allow-listed admin email — every
    // other Google account is rejected right at the OAuth callback.
    signIn({ user }) {
      return !!user.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
    },
  },
});
