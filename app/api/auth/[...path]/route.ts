import { auth } from "@/lib/auth/server";

type Ctx = { params: Promise<{ path: string[] }> };

async function dispatch(method: string, req: Request, ctx: Ctx) {
  const handler = auth.handler() as Record<string, (r: Request, c: Ctx) => Response | Promise<Response>>;
  const fn = handler[method];
  if (!fn) {
    return new Response("Method not allowed", { status: 405 });
  }
  return fn(req, ctx);
}

export function GET(req: Request, ctx: Ctx) {
  return dispatch("GET", req, ctx);
}
export function POST(req: Request, ctx: Ctx) {
  return dispatch("POST", req, ctx);
}
export function PUT(req: Request, ctx: Ctx) {
  return dispatch("PUT", req, ctx);
}
export function DELETE(req: Request, ctx: Ctx) {
  return dispatch("DELETE", req, ctx);
}
export function PATCH(req: Request, ctx: Ctx) {
  return dispatch("PATCH", req, ctx);
}