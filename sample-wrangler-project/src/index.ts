export default {
  async fetch(
    req: Request,
    env: any,
    ctx: ExecutionContext
  ): Promise<Response> {
    const returnPayload = {
      ok: true,
      body: await req.json().catch((e) => e.toString()),
    }

    return new Response(JSON.stringify(returnPayload, null, "  "), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  },
}
