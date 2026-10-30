import React from "react";

const AFFILIATE_LINK = "https://temu.to/k/e2i1e820kbd";

export default function TemuAd() {
  return (
    <section style={styles.card}>
      <div style={styles.banner}>
        <img
          src="/temu-affiliate-banner.jpg"
          alt="Temu Affiliate Program"
          style={styles.bannerImage}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div style={styles.bannerFallback}>
          <strong>TEMU</strong>
          <h2>Earn up to ₦100,000,000</h2>
          <p>Credit per month</p>
        </div>
      </div>

      <div style={styles.content}>
        <h2 style={styles.heading}>🚀 Just 1 Click!</h2>

        <p style={styles.message}>
          Hi! Join Temu’s affiliate program via my link—it’s free to join.
          You will earn up to <strong style={styles.highlight}>₦12,000</strong>
          {" "}first user bonus, and you'll get free rewards instantly! 🎉
        </p>

        <p style={styles.commission}>
          💡 <strong style={styles.highlight}>Commission Boost:</strong>{" "}
          Your commission auto-upgrades to{" "}
          <strong style={styles.highlight}>35%</strong> after signing up!
        </p>

        <a
          href={AFFILIATE_LINK}
          target="_blank"
          rel="noopener noreferrer sponsored"
          style={styles.button}
        >
          ↗ Join Temu Now
        </a>

        <p style={styles.disclosure}>
          Affiliate promotion. Offers and rewards are subject to Temu’s terms.
        </p>
      </div>
    </section>
  );
}

const styles = {
  card: {
    width: "100%",
    boxSizing: "border-box",
    margin: "30px 0",
    overflow: "hidden",
    borderRadius: "22px",
    border: "1px solid #25415a",
    background: "#07121e",
    color: "#ffffff",
    fontFamily: "Arial, sans-serif",
  },
  banner: {
    position: "relative",
    minHeight: "180px",
    background: "#062a9d",
  },
  bannerImage: {
    display: "block",
    width: "100%",
    height: "auto",
    objectFit: "cover",
  },
  bannerFallback: {
    padding: "24px",
    color: "#ffffff",
    background: "#08247d",
  },
  content: {
    padding: "22px",
  },
  heading: {
    margin: "0 0 16px",
    color: "#ffe51b",
    fontSize: "clamp(26px, 5vw, 42px)",
  },
  message: {
    margin: "0 0 18px",
    fontSize: "clamp(16px, 3.5vw, 21px)",
    lineHeight: 1.6,
    overflowWrap: "anywhere",
  },
  commission: {
    margin: "0 0 22px",
    fontSize: "clamp(16px, 3.5vw, 21px)",
    lineHeight: 1.6,
  },
  highlight: {
    color: "#ffe51b",
  },
  button: {
    display: "block",
    boxSizing: "border-box",
    width: "100%",
    padding: "18px 12px",
    borderRadius: "14px",
    background: "linear-gradient(100deg, #ff7a00, #ff4b00)",
    color: "#ffffff",
    textAlign: "center",
    textDecoration: "none",
    fontSize: "clamp(18px, 4vw, 25px)",
    fontWeight: 800,
  },
  disclosure: {
    margin: "14px 0 0",
    color: "#a9bacb",
    fontSize: "12px",
    textAlign: "center",
    lineHeight: 1.5,
  },
};
