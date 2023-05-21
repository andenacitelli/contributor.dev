import {initTRPC} from "@trpc/server";
import {type CreateNextContextOptions} from "@trpc/server/adapters/next";
import {getServerSession, NextAuthOptions, type Session} from "next-auth";
import superjson from "superjson";

import {PrismaClient} from "@/generated/client";

import {prisma} from "../database";
import GoogleProvider from "next-auth/providers/google";

import {environment} from "@/env/server.mjs";

type CreateContextOptions = {
  session: Session | null;
  prisma: PrismaClient;
};

const createInnerTRPCContext = (options: CreateContextOptions) => {
  return {
    session: options.session,
    prisma,
  };
};

const genericNextAuthOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: environment.GOOGLE_CLIENT_ID as string,
      clientSecret: environment.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
  ],
};

export const createTRPCContext = async (options: CreateNextContextOptions) => {
  const session = await getServerSession(
    options.req,
    options.res,
    genericNextAuthOptions
  );
  return createInnerTRPCContext({
    session,
    prisma,
  });
};

export const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export type TRPCContextType = ReturnType<typeof createInnerTRPCContext>;
export type ProtectedTRPCContextType = TRPCContextType & {
  session: {
    user: {
      email: string;
    };
  };
};

export const createTRPCRouter = t.router;

export const procedure = t.procedure;
