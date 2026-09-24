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

        <div style={styles.sectionTitle}>
          <h2>Today's Predictions</h2>
          <span style={styles.demo}>Demo data</span>
        </div>

        {matches.map((match, index) => (
          <article key={index} style={styles.card}>
            <div style={styles.teams}>
              <strong>{match.home}</strong>
              <span>VS</span>
              <strong>{match.away}</strong>
            </div>

            <div style={styles.line} />

            <div style={styles.probabilities}>
              <div>
                <strong>{match.homeWin}%</strong>
                <span>Home Win</span>
              </div>

              <div>
                <strong>{match.draw}%</strong>
                <span>Draw</span>
              </div>

              <div>
                <strong>{match.awayWin}%</strong>
                <span>Away Win</span>
              </div>
            </div>

            <div style={styles.score}>
              <span>Predicted Score</span>
              <strong>{match.score}</strong>
            </div>

            <button
              style={styles.button}
              onClick={() => setSelected(index)}
            >
              View Analysis →
            </button>

            {selected === index && (
              <div style={styles.analysis}>
                <h3>Match Analysis</h3>
                <p>
                  This demonstration prediction uses estimated probabilities
                  based on team form, goals data and home advantage.
                </p>
                <p>
                  These figures are examples only and are not guaranteed
                  results.
                </p>
              </div>
            )}
          </article>
        ))}

        <section style={styles.method}>
          <h2>How our predictions work</h2>

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
    background: "#06101f",
    color: "#ffffff",
    fontFamily: "Arial, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "25px 6%",
    borderBottom: "1px solid #19304a",
  },

  brandGreen: {
    color: "#19d66b",
    fontSize: "32px",
    fontWeight: "800",
  },

  brandWhite: {
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: "800",
    letterSpacing: "7px",
  },

  menu: {
    background: "#10253a",
    color: "#ffffff",
    border: "none",
    borderRadius: "15px",
    fontSize: "28px",
    padding: "12px 18px",
  },

  container: {
    width: "90%",
    maxWidth: "900px",
    margin: "0 auto",
    paddingBottom: "50px",
  },

  hero: {
    textAlign: "center",
    padding: "55px 10px 35px",
  },

  badge: {
    color: "#19d66b",
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "25px",
  },

  title: {
    fontSize: "42px",
    margin: "10px 0",
  },

  subtitle: {
    color: "#aab8c9",
    fontSize: "20px",
    lineHeight: "1.6",
  },

  sectionTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "20px 0",
  },

  demo: {
    color: "#19d66b",
    fontWeight: "700",
  },

  card: {
    background: "#0d1d2e",
    border: "1px solid #1b3853",
    borderRadius: "24px",
    padding: "30px",
    marginBottom: "25px",
  },

  teams: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "24px",
  },

  line: {
    height: "1px",
    background: "#284158",
    margin: "25px 0",
  },

  probabilities: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    textAlign: "center",
    gap: "10px",
  },

  probabilities: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    textAlign: "center",
    gap: "10px",
  },

  score: {
    display: "flex",
    justifyContent: "space-between",
    background: "#071526",
    padding: "20px",
    borderRadius: "15px",
    marginTop: "25px",
    fontSize: "19px",
  },

  button: {
    width: "100%",
    marginTop: "20px",
    padding: "17px",
    border: "none",
    borderRadius: "14px",
    background: "#19d66b",
    color: "#04100a",
    fontSize: "18px",
    fontWeight: "800",
  },

  analysis: {
    marginTop: "20px",
    padding: "20px",
    background: "#10263b",
    borderRadius: "15px",
    color: "#d4deea",
    lineHeight: "1.6",
  },

  method: {
    background: "#0d1d2e",
    border: "1px solid #1b3853",
    borderRadius: "24px",
    padding: "30px",
    marginTop: "40px",
    textAlign: "center",
  },

  factors: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
    marginTop: "25px",
    fontSize: "18px",
  },

  disclaimer: {
    textAlign: "center",
    color: "#8191a5",
    marginTop: "45px",
    fontSize: "17px",
  },
};

export default App;
