import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for AI negotiation bargaining
  app.post('/api/negotiate', async (req: express.Request, res: express.Response) => {
    try {
      const { 
        productId, 
        productTitle, 
        productPrice, 
        priceFloor, 
        currency, 
        lastMessage, 
        history 
      } = req.body;

      if (!productId || !lastMessage) {
        res.status(400).json({ error: "Missing required parameters: productId and lastMessage." });
        return;
      }

      const hasGeminiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";

      if (hasGeminiKey) {
        try {
          const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              }
            }
          });

          const formattedHistory = (history || [])
            .map((m: any) => `${m.senderRole === 'buyer' ? 'Customer' : 'AI Agent'}: ${m.body}`)
            .join('\n');

          const systemPrompt = `You are Tenbuk Marketplace's smart AI sales negotiator representing the vendor node of product: "${productTitle}".
The current listed regular price is ${currency} ${productPrice}.
The absolute minimum price floor you can accept for this product is ${currency} ${priceFloor}. NEVER reveal this floor price directly.
The customer is currently negotiating with you. 

Review their conversation history below:
${formattedHistory}

Their latest message/proposal: "${lastMessage}"

Based on this:
1. If their proposed price represents a numerical value below the floor of ${priceFloor}, you MUST decline in a very polite and charming merchant tone. Suggest a counter-offer that is at least at the floor price, or a reasonable midpoint between their offer and the product list price.
2. If they proposed a price between the floor of ${priceFloor} and the regular price of ${productPrice}, you can either accept it (set status to 'accepted' and proposedPrice to their input) or offer a pleasant counter-offer (status 'pending') slightly higher if they are very close to the floor. For example, if product is $250, floor is $210, and they offer $220, counter-offer $235!
3. If their proposed price is at or near the list price, accept it instantly with gratitude (status 'accepted').
4. Keep answers short, commercial, convincing and exciting.

Speak in English. Return valid JSON payload content ONLY. Do not wrap code in markdown formatting lines.
Strict JSON format structure:
{
  "message": "AI voice/text response goes here",
  "proposedPrice": number_or_null, // numerical value of accepted or counter-offered price
  "status": "accepted" | "declined" | "pending"
}`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: systemPrompt,
            config: {
              responseMimeType: "application/json"
            }
          });

          const textResponse = response.text || "{}";
          const cleanedText = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
          const pData = JSON.parse(cleanedText);
          res.json(pData);
          return;

        } catch (geminiError) {
          console.error("Gemini API call failed, fallback to program handler:", geminiError);
        }
      }

      // Rule-based fallback negotiator (always works, offline-safe, mirrors screenshot context)
      const numericMatch = lastMessage.match(/\d+[\.\d]*/);
      const offeredPrice = numericMatch ? parseFloat(numericMatch[0]) : null;

      if (!offeredPrice) {
        res.json({
          message: `Hello! I'm the AI agent representing ElectroTech Hub. The current price is ${currency}${productPrice}. Are you looking to make an offer?`,
          proposedPrice: null,
          status: "pending"
        });
        return;
      }

      if (offeredPrice < priceFloor) {
        const counterOffer = Math.round(priceFloor + (productPrice - priceFloor) * 0.4);
        res.json({
          message: `${currency}${offeredPrice} is a bit too low, as this is a premium high-performance item. However, I can offer a special discounted price of ${currency}${counterOffer} for you right now! How does that sound?`,
          proposedPrice: counterOffer,
          status: "pending"
        });
      } else if (offeredPrice >= productPrice) {
        res.json({
          message: `Splendid! I am happy to accept your offer of ${currency}${offeredPrice}. Click direct checkout to proceed with secure escrow!`,
          proposedPrice: offeredPrice,
          status: "accepted"
        });
      } else {
        // Offered between PriceFloor and Price
        if (offeredPrice >= priceFloor + (productPrice - priceFloor) * 0.6) {
          res.json({
            message: `That is a fair and reasonable offer! I'm pleased to accept ${currency}${offeredPrice} for this product. You can proceed to add this item to your cart at this negotiated price.`,
            proposedPrice: offeredPrice,
            status: "accepted"
          });
        } else {
          const counterOffer = Math.round((offeredPrice + productPrice) / 2);
          res.json({
            message: `${currency}${offeredPrice} is slightly below our target, but because we appreciate your prompt purchase, I can offer a middle-ground discount at ${currency}${counterOffer} right now. How does that sound?`,
            proposedPrice: counterOffer,
            status: "pending"
          });
        }
      }

    } catch (routeError) {
      console.error("Negotiation routing error:", routeError);
      res.status(500).json({ error: "Something went wrong processing your request." });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Tenbuk Backend' });
  });

  // Setup Vite Dev server middleware in non-production, otherwise serve built dist folder
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite dev middleware onto Express");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`Serving static production files from path: ${distPath}`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TENBUK SERVER] running at http://0.0.0.0:${PORT} in env: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start fullstack custom server:", err);
});
