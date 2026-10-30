import express from "express";
import type { Server } from "http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { localFinanceRouter } from "./routes";

describe("local finance HTTP mode", () => {
  const app = express();
  app.use(express.json());
  app.use("/api/local-finance", localFinanceRouter);
  let server: Server;
  let origin = "";

  beforeAll(async () => {
    server = app.listen(0, "127.0.0.1");
    await new Promise<void>((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
    });
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server did not bind to a TCP port");
    origin = `http://127.0.0.1:${address.port}/api/local-finance`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  });

  it("reports demo mode and refuses writes when FINANCE_DATABASE_URL is not initialized", async () => {
    const stateResponse = await fetch(`${origin}/state`);
    expect(stateResponse.status).toBe(200);
    expect(await stateResponse.json()).toEqual({ enabled: false });

    const writeResponse = await fetch(`${origin}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "Teste", amount: 1, type: "expense", categoryId: "food", date: "2026-10-29" }),
    });
    expect(writeResponse.status).toBe(503);
    expect((await writeResponse.json()).error).toContain("banco financeiro local");
  });
});
