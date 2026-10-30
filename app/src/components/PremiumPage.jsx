import { useState } from "react";

export default function PremiumPage({ onBack }) {
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function unlockPremium() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/premium/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Invalid access code.");
      } else {
        setUnlocked(true);
        setMessage("Access code accepted!");
      }
    } catch {
      setMessage("Connection error. Please try again.");
    }

    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#06111f",
      color: "white",
      fontFamily: "Arial, sans-serif",
      padding: "25px 20px"
    }}>
      <div style={{ maxWidth: "700px", margin: "auto" }}>
        <button onClick={onBack} style={{
          padding: "12px 20px",
          border: "1px solid #18e46f",
          borderRadius: "10px",
          background: "#0d2135",
          color: "white",
          fontSize: "16px"
        }}>
          ← Back to Home
        </button>

        <div style={{
          textAlign: "center",
          marginTop: "45px",
          padding: "30px 20px",
          background: "#0d2135",
          border: "1px solid #1c4565",
          borderRadius: "22px"
        }}>
          <div style={{ fontSize: "45px" }}>👑</div>
          <h1 style={{ color: "#18e46f" }}>PREMIUM PREDICTIONS</h1>
          <p style={{ color: "#c7d1dc", lineHeight: 1.7 }}>
            Exclusive football analysis featuring six selected
            correct-score predictions from our supported leagues.
          </p>

          {!unlocked ? (
            <>
              <h3>Enter Your Premium Access Code</h3>

              <input
                type="password"
                value={code}
                maxLength={20}
                onChange={e => setCode(e.target.value)}
                placeholder="Enter your 20-character code"
                style={{
                  boxSizing: "border-box",
                  width: "100%",
                  padding: "17px",
                  borderRadius: "10px",
                  border: "1px solid #18e46f",
                  background: "#06111f",
                  color: "white",
                  fontSize: "16px",
                  marginBottom: "15px"
                }}
              />

              <button
                onClick={unlockPremium}
                disabled={loading || code.length !== 20}
                style={{
                  width: "100%",
                  padding: "17px",
                  border: "none",
                  borderRadius: "10px",
                  background: "#18e46f",
                  color: "#06111f",
                  fontWeight: "bold",
                  fontSize: "17px"
                }}
              >
                {loading ? "Checking..." : "UNLOCK PREMIUM GAMES"}
              </button>
            </>
          ) : (
            <div style={{
              padding: "20px",
              background: "#102c43",
              borderRadius: "12px"
            }}>
              <h2 style={{ color: "#18e46f" }}>Access Granted</h2>
              <p>Your premium access has been verified.</p>
              <p>The six match selections will appear here once the
                premium fixtures and prediction engine are connected.</p>
            </div>
          )}

          {message && (
            <p style={{ color: "#18e46f", marginTop: "18px" }}>
              {message}
            </p>
          )}

          <a
            href="https://wa.me/2348136241633"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              marginTop: "25px",
              padding: "17px",
              borderRadius: "10px",
              background: "#25D366",
              color: "#06111f",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "17px"
            }}
          >
            CHAT WITH US ON WHATSAPP
          </a>
        </div>
      </div>
    </div>
  );
}
