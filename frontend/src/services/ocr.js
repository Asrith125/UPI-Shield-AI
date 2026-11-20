
import { createWorker } from "tesseract.js";

let workerPromise = null;

export function warmupOCR() {
  if (!workerPromise) {
    workerPromise = createWorker("eng").catch((error) => {
      workerPromise = null;
      throw error;
    });
  }
  return workerPromise;
}

export async function extractPaymentData(file) {
  const start = performance.now();

  const worker = await warmupOCR();

  const { data } = await worker.recognize(file);

  const rawText = data.text || "";
  const text = rawText.replace(/\s+/g, " ");

  // Detect likely UPI application
  let app = "Not identified";

  if (/google\s*pay|gpay|g\s*pay/i.test(text)) {
    app = "Google Pay";
  } else if (/phone\s*pe/i.test(text)) {
    app = "PhonePe";
  } else if (/paytm/i.test(text)) {
    app = "Paytm";
  }

  // Extract amount
  const amountMatch = text.match(
    /(?:₹|INR|Rs\.?)\s*([\d,]+(?:\.\d{1,2})?)/i
  );

  const amount = amountMatch
    ? Number(amountMatch[1].replace(/,/g, ""))
    : null;

  // Extract UPI transaction reference
  const idMatch = text.match(
    /(?:UTR|UPI\s*(?:transaction\s*)?(?:ID|ref(?:erence)?(?:\s*(?:no|number))?)|(?:transaction|reference)\s*(?:ID|no\.?|number))\s*[:#-]?\s*([A-Z0-9]{10,24})/i
  );

  const transactionId = idMatch?.[1] ?? null;

  // Extract date and time
  const dateMatch = text.match(
    /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\s+\d{1,2}:\d{2}(?:\s*[AP]M)?/i
  );

  return {
    app,
    amount,
    transactionId,
    timestamp: dateMatch?.[0] ?? null,
    rawText,
    ocrConfidence: data.confidence ?? null,
    processingMs: Math.round(performance.now() - start)
  };
}
