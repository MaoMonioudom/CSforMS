import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      style={{
        background: "var(--color-navy-deep)",
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
        gap: "1rem",
      }}
    >
      <div style={{ fontSize: "3rem" }}>📚</div>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-parchment)",
          fontSize: "2rem",
        }}
      >
        Page not found
      </h1>
      <p style={{ color: "var(--color-muted)", maxWidth: 380 }}>
        This book doesn't exist in our library. Head back to the shelves and
        find something that calls to you.
      </p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>
        Back to Home
      </Link>
    </div>
  );
}
