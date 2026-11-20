
import { useState } from "react";
import { analyzeScreenshot } from "./services/analyzer";
import "./App.css";

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  function upload(e) {
    const image = e.target.files?.[0];
    if (!image) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(image.type)
      || image.size > 10 * 1024 * 1024) {
      alert("Select a JPG, PNG or WebP under 10 MB.");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);

    setFile(image);
    setPreview(URL.createObjectURL(image));
    setResult(null);
  }

  async function scan() {
    if (!file || loading) return;

    setLoading(true);

    try {
      const data = await analyzeScreenshot(file);
      setResult(data);

      setHistory(prev => [{
        id: crypto.randomUUID(),
        name: file.name,
        verdict: data.verdict,
        mode: data.mode,
        date: new Date().toLocaleString()
      }, ...prev]);
    } catch (error) {
      alert("Analysis failed: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo">🛡 UPI SHIELD AI</div>
        <p>SECURITY WORKSPACE</p>
        <div className="nav active">◈ Dashboard</div>
        <a className="nav" href="#scanner">▣ Screenshot Scanner</a>
        <a className="nav" href="#history">◷ Scan History</a>

        <div className="sidebar-footer">
          ● Frontend Prototype
          <small>Code Fuzion 2026 — H2</small>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <span>Merchant Security Dashboard</span>
          <span className="demo">DEMO MODE</span>
        </header>

        <div className="hero">
          <div className="eyebrow">SMART FRAUD SCREENING</div>
          <h1>Secure every payment.</h1>
          <p>
            Analyze payment screenshots for suspicious activity
            and visual inconsistencies.
          </p>
          <span>Google Pay · PhonePe · Paytm</span>
        </div>

        <section className="stats">
          <div className="stat">
            <span>Total Scans</span>
            <strong>{history.length}</strong>
            <small>Current session</small>
          </div>
          <div className="stat">
            <span>Suspicious</span>
            <strong>
              {history.filter(x => x.verdict === "Suspicious").length}
            </strong>
            <small>Flagged screenshots</small>
          </div>
          <div className="stat">
            <span>Inconclusive</span>
            <strong>
              {history.filter(x => x.verdict === "Inconclusive").length}
            </strong>
            <small>Need verification</small>
          </div>
        </section>

        <section className="workspace" id="scanner">
          <div className="panel">
            <h2>Screenshot Scanner</h2>
            <p>Upload a payment screenshot to begin.</p>

            <label className="upload-box">
              {preview ? (
                <img src={preview} alt="Screenshot preview" />
              ) : (
                <>
                  <div className="upload-symbol">↑</div>
                  <strong>Upload Screenshot</strong>
                  <span>PNG, JPG or WebP · Max 10 MB</span>
                </>
              )}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={upload}
                hidden
              />
            </label>

            {file && <p className="filename">{file.name}</p>}

            <button
              className="scan-button"
              disabled={!file || loading}
              onClick={scan}
            >
              {loading ? "Analyzing..." : "Analyze Screenshot →"}
            </button>
          </div>

          <div className="panel">
            <h2>Security Analysis</h2>
            <p>Transaction information and findings.</p>

            {result ? (
              <>
                <div className="verdict">
                  <span>SCREENING VERDICT</span>
                  <h2>{result.verdict}</h2>
                  <small>{result.mode} — Payment not verified</small>
                </div>

                <div className="details">
                  <div>UPI App <b>{result.app}</b></div>
                  <div>
                    Amount <b>{result.amount ?? "Unknown"}</b>
                  </div>
                  <div>
                    Transaction ID
                    <b>{result.transactionId ?? "Unknown"}</b>
                  </div>
                  <div>
                    Timestamp
                    <b>{result.timestamp ?? "Unknown"}</b>
                  </div>
                </div>

                <h3>Analysis Findings</h3>
                {result.reasons.map((reason, i) => (
                  <div className="finding" key={i}>
                    ◉ {reason}
                  </div>
                ))}
              </>
            ) : (
              <div className="empty">
                <div>◇</div>
                <h3>Ready to analyze</h3>
                <p>Upload a screenshot to view the analysis report.</p>
              </div>
            )}
          </div>
        </section>

        <section className="panel history" id="history">
          <h2>Recent Scans</h2>
          {history.length === 0 ? (
            <p>No scans yet.</p>
          ) : (
            history.map(scan => (
              <div className="history-row" key={scan.id}>
                <div>
                  <strong>{scan.name}</strong>
                  <small>{scan.date} · {scan.mode}</small>
                </div>
                <span>{scan.verdict}</span>
              </div>
            ))
          )}
        </section>

        <footer>
          UPI Shield AI is a screenshot screening tool.
          Confirm payments using bank or merchant transaction records.
        </footer>
      </main>
    </div>
  );
}
