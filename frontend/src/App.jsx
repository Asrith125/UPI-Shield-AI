
import { useState } from "react";
import "./App.css";

export default function App() {
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState(false);

  function handleUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
    setFileName(file.name);
    setResult(false);
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "#081225",
      color: "#ffffff",
      padding: "50px 24px",
      textAlign: "center",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1>🛡️ UPI SHIELD AI</h1>
      <p>Fake UPI Payment Screenshot Detector</p>
      <p style={{ color: "#ffcc66" }}>
        Code Fuzion 2026 | H2 | Frontend Demo
      </p>

      <section style={{
        background: "#142440",
        borderRadius: "16px",
        padding: "35px",
        maxWidth: "550px",
        margin: "35px auto"
      }}>
        <h2>Upload Payment Screenshot</h2>

        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
        />

        {image && (
          <div style={{ marginTop: 25 }}>
            <img
              src={image}
              alt="Payment screenshot"
              style={{ maxWidth: "100%", maxHeight: 300 }}
            />
            <p>{fileName}</p>
          </div>
        )}

        <button
          disabled={!image}
          onClick={() => setResult(true)}
          style={{
            marginTop: 25,
            padding: "14px 30px",
            border: "none",
            borderRadius: "9px",
            background: "#3478f6",
            color: "white",
            cursor: "pointer"
          }}
        >
          Preview Analysis
        </button>

        {result && (
          <div style={{
            marginTop: 25,
            padding: 20,
            background: "#29374d",
            borderRadius: 10
          }}>
            <h3>Verdict: Inconclusive</h3>
            <p>
              Frontend demo only. Fraud detection
              engine not connected yet.
            </p>
            <p>
              Confirm payment using the merchant's
              own bank or UPI app.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
