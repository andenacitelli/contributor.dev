import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { environment } from "@/env/server.mjs";
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: environment.GOOGLE_CLIENT_ID,
      clientSecret: environment.GOOGLE_CLIENT_SECRET,
    }),
  ],
};
export default NextAuth(authOptions);
