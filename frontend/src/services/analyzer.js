
import { extractPaymentData } from "./ocr.js";
import { detectFraud } from "./detection.js";

export async function analyzeScreenshot(file) {
  const start = performance.now();

  // Step 1: OCR
  const ocr = await extractPaymentData(file);

  // Step 2: Fraud checks
  const detection = await detectFraud(ocr, file);

  return {
    ...ocr,
    ...detection,
    processingMs: Math.round(performance.now() - start),
    mode: "BASIC_CHECKS"
  };
}
