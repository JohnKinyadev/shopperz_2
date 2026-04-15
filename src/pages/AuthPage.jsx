import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMarketplace } from "../context/MarketplaceContext";

function AuthPage() {
  const navigate = useNavigate();
  const { currentUser, setAuthMode, signIn, signUp, authError } = useMarketplace();
  const [form, setForm] = useState({
    name: "Amina Wanjiku",
    email: "amina@example.com",
    password: "12345678",
  });

  const mode = currentUser.mode;

  // Redirect to home if already authenticated
  useEffect(() => {
    if (currentUser.isAuthenticated) {
      navigate("/");
    }
  }, [currentUser.isAuthenticated, navigate]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (mode === "signup") {
      await signUp(form);
      return;
    }

    await signIn(form);
  }

  return (
    <div className="auth-layout">
      <section className="panel auth-side-card">
        <p className="panel-kicker">Welcome back</p>
        <h1>Create account or login to access the website</h1>
        <p>
          This page simulates sign-in and sign-up
        </p>
        {/* <p>
          Demo admin login: <strong>admin@shopperz.local</strong> / <strong>Admin123!</strong>
        </p> */}
        <div className="seller-stat-grid">
          <article>
            <strong>Having no Account</strong>
            <span>Create account</span>
          </article>
          <article>
            <strong>Already have an account</strong>
            <span>Login</span>
          </article>
          {/* <article>
            <strong>Demo-ready</strong>
            <span>Local state persistence</span>
          </article> */}
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
            {mode === "signup" ? "Create account" : "Sign in"}
          </button>

          {mode === "signin" ? (
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  email: "admin@shopperz.local",
                  password: "Admin123!",
                }))
              }
            >
              Use admin login
            </button>
          ) : null}

          {authError && <p className="error-message">{authError}</p>}
        </form>
      </section>
    </div>
  );
}

export default AuthPage;
