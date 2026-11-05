// In-memory stand-in for Supabase's REST API, used only by the end-to-end tests.
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const orders = [];

createServer(async (req, res) => {
  const send = (code, body) => {
    res.writeHead(code, { "Content-Type": "application/json" });
    res.end(body === undefined ? "" : JSON.stringify(body));
  };
  if (req.headers.apikey !== KEY || req.headers.authorization !== `Bearer ${KEY}`) return send(401, { message: "bad key" });

  const url = new URL(req.url, "http://localhost");
  if (url.pathname !== "/rest/v1/orders") return send(404, { message: "not found" });

  let raw = "";
  for await (const chunk of req) raw += chunk;

  if (req.method === "POST") {
    orders.unshift({ id: randomUUID(), status: "pending", created_at: new Date().toISOString(), ...JSON.parse(raw) });
    return send(201);
  }
  if (req.method === "GET") return send(200, orders);
  if (req.method === "PATCH") {
    const id = (url.searchParams.get("id") ?? "").replace(/^eq\./, "");
    const order = orders.find((o) => o.id === id);
    if (order) Object.assign(order, JSON.parse(raw));
    return send(204);
  }
  send(405, { message: "method not allowed" });
}).listen(Number(process.env.MOCK_PORT ?? 54399), "127.0.0.1");
