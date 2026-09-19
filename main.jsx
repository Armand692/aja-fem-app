import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { configError } from "./storage.js";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("Erreur applicative :", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 640, margin: "60px auto", padding: 24, color: "#152238" }}>
          <h1 style={{ color: "#D9503F", fontSize: 22 }}>Une erreur est survenue</h1>
          <p>L'application n'a pas pu s'afficher correctement. Détail technique ci-dessous — envoie ce message à Claude pour correction :</p>
          <pre style={{ background: "#F5F7FB", padding: 16, borderRadius: 8, overflowX: "auto", fontSize: 13 }}>{String(this.state.error?.message || this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function ConfigErrorScreen({ message }) {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 640, margin: "60px auto", padding: 24, color: "#152238" }}>
      <h1 style={{ color: "#D9503F", fontSize: 22 }}>Configuration manquante</h1>
      <p>{message}</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      {configError ? <ConfigErrorScreen message={configError} /> : <App />}
    </ErrorBoundary>
  </React.StrictMode>
);
