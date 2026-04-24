import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { pitchRouter } from "./routes/pitch";
import { userRouter } from "./routes/user";
import { adminRouter } from "./routes/admin";
import { mpesaRouter } from "./routes/mpesa";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts,
  // all api routes should start with '/api/' so that the gateway can route correctly.
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  /** Pitch analysis and history. */
  pitch: pitchRouter,

  /** User profile, token balance, XP, and level progression. */
  user: userRouter,

  /** Admin and founder configuration. */
  admin: adminRouter,

  /** M-Pesa payment integration. */
  mpesa: mpesaRouter,
});

export type AppRouter = typeof appRouter;
