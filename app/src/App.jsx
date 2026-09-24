import { useState } from "react";

const matches = [
  {
    home: "Arsenal",
    away: "Chelsea",
    homeWin: 58,
    draw: 24,
    awayWin: 18,
    score: "2 - 1",
  },
  {
    home: "Liverpool",
    away: "Everton",
    homeWin: 64,
    draw: 22,
    awayWin: 14,
    score: "2 - 0",
  },
  {
    home: "Barcelona",
    away: "Valencia",
    homeWin: 68,
    draw: 19,
    awayWin: 13,
    score: "3 - 1",
  },
];

function App() {
  const [selected, setSelected] = useState(null);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.brandGreen}>ARS SPORT</div>
          <div style={styles.brandWhite}>PREDICT</div>
        </div>

        <button style={styles.menu}>☰</button>
      </header>

      <main style={styles.container}>
        <section style={styles.hero}>
          <div style={styles.badge}>⚽ FOOTBALL INTELLIGENCE</div>

          <h1 style={styles.title}>Football Predictions</h1>

          <p style={styles.subtitle}>
            Statistical football analysis, probabilities and match insights.
          </p>
        </section>

        <section>
          <div style={styles.sectionTitle}>
            <h2>Today's Predictions</h2>
            <span style={styles.demo}>Demo data</span>
          </div>

          {matches.map((match, index) => (
            <div key={index} style={styles.card}>
              <div style={styles.teams}>
                <strong>{match.home}</strong>
                <span>VS</span>
                <strong>{match.away}</strong>
              </div>

              <div style={styles.line} />

              <div style={styles.probabilities}>
                <div>
                  <b>{match.homeWin}%</b>
                  <span>Home Win</span>
                </div>

                <div>
                  <b>{match.draw}%</b>
                  <span>Draw</span>
                </div>

                <div>
                  <b>{match.awayWin}%</b>
                  <span>Away Win</span>
                </div>
              </div>

              <div style={styles.score}>
                <span>Predicted Score</span>
                <strong>{match.score}</strong>
              </div>

              <button
                style={styles.analysisButton}
                onClick={() => setSelected(match)}
              >
                View Analysis →
              </button>

              {selected === match && (
                <div style={styles.analysis}>
                  <h3>Match Analysis</h3>
                  <p>
                    The displayed probabilities are statistical estimates
                    based on example football data. They are not guarantees.
                  </p>
                </div>
              )}
            </div>
          ))}
        </section>

        <section style={styles.method}>
          <h2 style={styles.methodTitle}>How our predictions work</h2>

          <p>
            ARS SPORT PREDICT uses statistical models and football data to
            estimate possible match outcomes.
          </p>

          <div style={styles.factors}>
            <span>📊 Team Form</span>
            <span>⚽ Goals Data</span>
            <span>🏠 Home Advantage</span>
            <span>📈 Probabilities</span>
          </div>
        </section>

        <p style={styles.disclaimer}>
          Predictions are statistical estimates, not guarantees.
        </p>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#06111f",
    color: "#ffffff",
    fontFamily: "Arial, sans-serif",
  },

  header: {
    padding: "28px 6%",
    background: "#0a1b2d",
    borderBottom: "1px solid #193650",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  brandGreen: {
    color: "#18e46f",
    fontSize: "34px",
    fontWeight: "900",
    lineHeight: "0.95",
  },

  brandWhite: {
    color: "#ffffff",
    fontSize: "34px",
    fontWeight: "900",
    letterSpacing: "8px",
  },

  menu: {
    background: "#112b43",
    color: "#ffffff",
    border: "none",
    borderRadius: "18px",
    fontSize: "34px",
    padding: "10px 18px",
  },

  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "45px 20px",
  },

  hero: {
    textAlign: "center",
    padding: "30px 10px 45px",
  },

  badge: {
    color: "#18e46f",
    fontSize: "24px",
    fontWeight: "800",
    marginBottom: "30px",
  },

  title: {
    color: "#ffffff",
    fontSize: "34px",
    margin: "0 0 20px",
  },

  subtitle: {
    color: "#c7d1dc",
    fontSize: "20px",
    lineHeight: "1.7",
    margin: "0 auto",
    maxWidth: "650px",
  },

  sectionTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  sectionTitleH2: {
    color: "#ffffff",
  },

  demo: {
    color: "#18e46f",
    fontWeight: "800",
  },

  card: {
    background: "#0d2135",
    border: "1px solid #1c4565",
    borderRadius: "28px",
    padding: "30px",
    marginBottom: "25px",
  },

  teams: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: "20px",
    fontSize: "25px",
    textAlign: "center",
  },

  line: {
    height: "1px",
    background: "#29465d",
    margin: "25px 0",
  },

  probabilities: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    textAlign: "center",
    gap: "10px",
  },

  probability: {
    color: "#ffffff",
  },

  score: {
    background: "#071729",
    borderRadius: "20px",
    padding: "25px",
    marginTop: "25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "20px",
  },

  analysisButton: {
    width: "100%",
    marginTop: "25px",
    padding: "20px",
    border: "none",
    borderRadius: "20px",
    background: "#18e46f",
    color: "#03100a",
    fontSize: "20px",
    fontWeight: "900",
  },

  analysis: {
    marginTop: "20px",
    padding: "20px",
    borderRadius: "16px",
    background: "#102c43",
    color: "#dce6ef",
  },

  method: {
    marginTop: "50px",
    padding: "35px 25px",
    borderRadius: "28px",
    background: "#0d2135",
    border: "1px solid #1c4565",
    textAlign: "center",
  },

  methodTitle: {
    color: "#ffffff",
  },

  factors: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "25px",
    marginTop: "30px",
    fontSize: "20px",
    color: "#ffffff",
  },

  disclaimer: {
    textAlign: "center",
    color: "#9fb0c1",
    fontSize: "18px",
    marginTop: "40px",
  },
};

export default App;
