
export async function analyzeScreenshot(file) {
  // Temporary integration placeholder.
  // Teammates will replace this with real OCR
  // and forensic analysis.

  return {
    verdict: "Inconclusive",
    app: "Not identified",
    amount: null,
    transactionId: null,
    timestamp: null,
    reasons: [
      "OCR engine is not connected yet",
      "Image forensics is not connected yet",
      "Verify the payment using your bank account"
    ],
    mode: "DEMO"
  };
}
