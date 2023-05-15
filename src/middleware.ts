import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { environment } from "@/env/server.mjs";

const INTERNAL_PATHS_REGEX = [/^\/api\/ingest/];

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  if (
    INTERNAL_PATHS_REGEX.some((regex) => regex.test(request.nextUrl.pathname))
  ) {
    try {
      z.literal(environment.SECRET).parse(request.headers.get("authorization"));
    } catch {
      return new NextResponse(undefined, { status: 401 });
    }
  }
  return NextResponse.next();
}
