import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

const payTo = "0x2CfEE66C8366d1472F7c2756B2C35680Cc454979";
const app = express();

const facilitator = new HTTPFacilitatorClient({
  url: "https://facilitator.payai.network",
});
const server = new x402ResourceServer(facilitator)
  .register("eip155:8453", new ExactEvmScheme());

app.get("/", (req, res) => res.send("ok"));

app.use(paymentMiddleware({
  "GET /price": {
    accepts: [{ scheme: "exact", price: "$0.01", network: "eip155:8453", payTo }],
    description: "Live BTC price in USD",
    mimeType: "application/json",
  },
}, server));

app.get("/price", async (req, res) => {
  try {
    const r = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
    const d = await r.json();
    res.json({ symbol: "BTC", usd: d.bitcoin.usd });
  } catch (e) {
    res.status(500).json({ error: "price unavailable" });
  }
});

app.listen(process.env.PORT || 3000);
