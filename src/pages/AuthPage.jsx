import { useState } from "react";
import { useMarketplace } from "../context/MarketplaceContext";

function AuthPage() {
  const { currentUser, setAuthMode, signIn, signUp } = useMarketplace();
  const [form, setForm] = useState({
    name: "Amina Wanjiku",
    email: "amina@example.com",
    password: "12345678",
  });

  const mode = currentUser.mode;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (mode === "signup") {
      signUp(form);
      return;
    }

    signIn(form);
  }

  return (
    <div className="auth-layout">
      <section className="panel auth-side-card">
        <p className="panel-kicker">Welcome back</p>
        <h1>Mock auth flow for the frontend capstone.</h1>
        <p>
          This page simulates sign-in and sign-up so the interface feels complete before any real
          backend integration.
        </p>
        <div className="seller-stat-grid">
          <article>
            <strong>Frontend</strong>
            <span>No backend required</span>
          </article>
          <article>
            <strong>React</strong>
            <span>Reusable auth UI</span>
          </article>
          <article>
            <strong>Demo-ready</strong>
            <span>Local state persistence</span>
          </article>
        </div>
      </section>

      <section className="panel auth-form-card">
        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "signin" ? "active" : ""}
            onClick={() => setAuthMode("signin")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={mode === "signup" ? "active" : ""}
            onClick={() => setAuthMode("signup")}
          >
            Create account
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <label>
              <span>Full name</span>
              <input name="name" value={form.name} onChange={handleChange} />
            </label>
          ) : null}

          <label>
            <span>Email address</span>
            <input name="email" type="email" value={form.email} onChange={handleChange} />
          </label>

          <label>
            <span>Password</span>
            <input name="password" type="password" value={form.password} onChange={handleChange} />
          </label>

          <button type="submit" className="primary-button">
            {mode === "signup" ? "Create frontend account" : "Sign in to demo"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default AuthPage;
