function App() {
      return (
          <div
                style={{
                        minHeight: "100vh",
                                background: "#07111f",
                                        color: "white",
                                                padding: "40px",
                                                        fontFamily: "Arial, sans-serif",
                                                                textAlign: "center",
                                                                      }}
                                                                          >
                                                                                <h1 style={{ color: "#18d26e", fontSize: "42px" }}>
                                                                                        ARS SPORT PREDICT
                                                                                              </h1>

                                                                                                    <p style={{ fontSize: "20px", color: "#b8c2cc" }}>
                                                                                                            Football Prediction Platform
                                                                                                                  </p>

                                                                                                                        <div
                                                                                                                                style={{
                                                                                                                                          maxWidth: "500px",
                                                                                                                                                    margin: "40px auto",
                                                                                                                                                              padding: "25px",
                                                                                                                                                                        background: "#0d1b2a",
                                                                                                                                                                                  borderRadius: "15px",
                                                                                                                                                                                          }}
                                                                                                                                                                                                >
                                                                                                                                                                                                        <h2>Today's Prediction</h2>
                                                                                                                                                                                                                <h3>Arsenal vs Chelsea</h3>

                                                                                                                                                                                                                        <p>Home Win: 58%</p>
                                                                                                                                                                                                                                <p>Draw: 24%</p>
                                                                                                                                                                                                                                        <p>Away Win: 18%</p>

                                                                                                                                                                                                                                                <button
                                                                                                                                                                                                                                                          style={{
                                                                                                                                                                                                                                                                      marginTop: "15px",
                                                                                                                                                                                                                                                                                  padding: "12px 20px",
                                                                                                                                                                                                                                                                                              background: "#18d26e",
                                                                                                                                                                                                                                                                                                          border: "none",
                                                                                                                                                                                                                                                                                                                      borderRadius: "8px",
                                                                                                                                                                                                                                                                                                                                  fontWeight: "bold",
                                                                                                                                                                                                                                                                                                                                            }}
                                                                                                                                                                                                                                                                                                                                                    >
                                                                                                                                                                                                                                                                                                                                                              View Analysis
                                                                                                                                                                                                                                                                                                                                                                      </button>
                                                                                                                                                                                                                                                                                                                                                                            </div>

                                                                                                                                                                                                                                                                                                                                                                                  <p style={{ color: "#7f8c9a" }}>
                                                                                                                                                                                                                                                                                                                                                                                          Predictions are statistical estimates, not guarantees.
                                                                                                                                                                                                                                                                                                                                                                                                </p>
                                                                                                                                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                                                                                                                                      );
                                                                                                                                                                                                                                                                                                                                                                                                      }

                                                                                                                                                                                                                                                                                                                                                                                                      export default App;