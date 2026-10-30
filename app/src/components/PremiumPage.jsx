import { useState } from "react";

export default function PremiumPage({ onBack }) {
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function unlockPremium() {
    if (code.length !== 20 || loading) return;

    setLoading(true);
    setMessage("");

    try {
      const verify = await fetch("/api/premium/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });

      const verifyData = await verify.json();

      if (!verify.ok || !verifyData.success) {
        setMessage(verifyData.message || "Invalid access code.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/premium/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Unable to load predictions.");
        setLoading(false);
        return;
      }

      setPredictions(data.predictions || []);
      setUnlocked(true);

      if (!data.predictions?.length) {
        setMessage("No upcoming fixtures are currently available. Please check again later.");
      } else {
        setMessage("Premium access verified successfully!");
      }

    } catch {
      setMessage("Connection error. Please try again.");
    }

    setLoading(false);
  }

  const panel = {
    background: "#0d2135",
    border: "1px solid #1c4565",
    borderRadius: "15px",
    padding: "18px",
    marginBottom: "15px"
  };

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
          marginTop: "35px",
          padding: "25px 15px",
          background: "#0d2135",
          border: "1px solid #1c4565",
          borderRadius: "22px"
        }}>
          <div style={{ fontSize: "45px" }}>👑</div>

          <h1 style={{ color: "#18e46f" }}>
            PREMIUM PREDICTIONS
          </h1>

          <p style={{ color: "#c7d1dc", lineHeight: 1.7 }}>
            Six selected correct-score predictions from
            eight supported football leagues.
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
                  background: loading || code.length !== 20
                    ? "#527363" : "#18e46f",
                  color: "#06111f",
                  fontWeight: "bold",
                  fontSize: "17px"
                }}
              >
                {loading ? "GENERATING PREDICTIONS..." : "UNLOCK PREMIUM"}
              </button>
            </>
          ) : (
            <div style={{ marginTop: "25px" }}>
              <h2 style={{ color: "#18e46f" }}>
                👑 PREMIUM ACCESS GRANTED
              </h2>

              <p style={{ color: "#c7d1dc" }}>
                Your premium selections are below.
              </p>

              <div style={{
                textAlign: "left",
                marginTop: "25px"
              }}>
                {predictions.map((item, index) => (
                  <div key={item.matchId} style={panel}>
                    <div style={{
                      color: "#18e46f",
                      fontWeight: "bold",
                      marginBottom: "12px"
                    }}>
                      #{index + 1} PREMIUM PICK
                    </div>

                    <div style={{
                      color: "#9eb1c5",
                      fontSize: "13px",
                      marginBottom: "12px"
                    }}>
                      {item.league}
                    </div>

                    <div style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      textAlign: "center",
                      lineHeight: 1.8
                    }}>
                      {item.homeTeam}
                      <div style={{
                        color: "#18e46f",
                        fontSize: "24px",
                        margin: "8px 0"
                      }}>
                        {item.predictedScore}
                      </div>
                      {item.awayTeam}
                    </div>

                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "15px",
                      borderTop: "1px solid #29465e",
                      paddingTop: "12px",
                      fontSize: "13px"
                    }}>
                      <span style={{ color: "#9eb1c5" }}>
                        Model probability
                      </span>
                      <strong style={{ color: "#18e46f" }}>
                        {item.probability}%
                      </strong>
                    </div>

                    <div style={{
                      color: "#9eb1c5",
                      fontSize: "12px",
                      marginTop: "10px"
                    }}>
                      {new Date(item.date).toLocaleString()}
                    </div>
                  </div>
                ))}

                {predictions.length === 0 && (
                  <p style={{ textAlign: "center" }}>
                    No upcoming fixtures available.
                  </p>
                )}
              </div>
            </div>
          )}

          {message && (
            <p style={{
              color: unlocked && predictions.length
                ? "#18e46f" : "#ffcc66",
              marginTop: "18px"
            }}>
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
