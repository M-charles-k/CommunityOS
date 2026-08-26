import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Building2,
  Droplets,
  Lock,
  Mail,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  Wrench,
} from "lucide-react";
import * as authService from "../services/auth.js";
import "../styles/auth.css";

const TENANTS = [
  { id: "green-valley", name: "Green Valley Estate" },
  { id: "sunrise", name: "Sunrise Apartments" },
  { id: "westlands", name: "Westlands Residence" },
];

const FLOATING_SERVICES = [
  {
    icon: Droplets,
    label: "Water Delivery",
    className: "water",
  },
  {
    icon: Trash2,
    label: "Waste Collection",
    className: "waste",
  },
  {
    icon: Wrench,
    label: "Maintenance",
    className: "maintenance",
  },
];

function getInitialTheme() {
  const savedTheme = localStorage.getItem(
    "communityos-auth-theme"
  );

  if (
    savedTheme === "dark" ||
    savedTheme === "light"
  ) {
    return savedTheme;
  }

  return window.matchMedia?.(
    "(prefers-color-scheme: dark)"
  ).matches
    ? "dark"
    : "light";
}

export default function Login({ onLogin, onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Keep Green Valley as the default for LOGIN.
  const [tenantId, setTenantId] =
    useState("green-valley");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    localStorage.setItem(
      "communityos-auth-theme",
      theme
    );

    document.documentElement.dataset.authTheme =
      theme;
  }, [theme]);

  function toggleTheme() {
    setTheme((current) =>
      current === "light" ? "dark" : "light"
    );
  }

  async function handleLogin(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await authService.login(
        email,
        password,
        tenantId
      );

      onLogin(result);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const nextTheme =
    theme === "light" ? "dark" : "light";

  return (
    <main
      className={`auth-page auth-theme-${theme}`}
      data-theme={theme}
    >
      <button
        type="button"
        className="auth-theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${nextTheme} mode`}
        title={`Switch to ${nextTheme} mode`}
      >
        {theme === "light" ? (
          <>
            <Moon size={18} />
            <span>Dark</span>
          </>
        ) : (
          <>
            <Sun size={18} />
            <span>Light</span>
          </>
        )}
      </button>

      {/* LEFT SHOWCASE */}
      <section className="auth-showcase">
        <div className="auth-showcase-grid" />

        <div className="auth-brand">
          <span className="auth-brand-icon">
            <Building2 size={22} />
          </span>

          <span>
            Community<span>OS</span>
          </span>
        </div>

        <div className="auth-showcase-content">
          <div className="auth-showcase-copy">
            <div className="auth-eyebrow">
              <Sparkles size={16} />
              SMART COMMUNITY PLATFORM
            </div>

            <h1>
              Empowering <span>Communities,</span>
              <br />
              together.
            </h1>

            <p>
              The intelligent way to manage, connect, and
              grow your community.
            </p>

            <div className="auth-copy-line" />
          </div>

          <div
            className="auth-floating-services"
            aria-label="Community services"
          >
            {FLOATING_SERVICES.map(
              ({
                icon: Icon,
                label,
                className,
              }) => (
                <div
                  className={`auth-float ${className}`}
                  key={label}
                >
                  <div className="auth-float-icon">
                    <Icon
                      size={25}
                      strokeWidth={1.9}
                    />
                  </div>

                  <span>{label}</span>
                </div>
              )
            )}
          </div>
        </div>

        <div className="auth-trust">
          <p>
            Great communities are built on trust,
            communication, and great technology.
          </p>

          <div className="auth-trust-bottom">
            <div
              className="auth-avatars"
              aria-label="Community members"
            >
              {["A", "J", "M", "K"].map(
                (letter) => (
                  <span key={letter}>
                    {letter}
                  </span>
                )
              )}
            </div>

            <div>
              Trusted by <strong>300+</strong>{" "}
              communities
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT FORM */}
      <section className="auth-form-panel">
        <div className="auth-panel-brand">
          <span className="auth-panel-brand-icon">
            <Building2 size={18} />
          </span>

          Community<span>OS</span>
        </div>

        <div className="auth-form-wrap">
          <div className="auth-form-heading">
            <span className="auth-kicker">
              WELCOME BACK
            </span>

            <h2>Sign in to your community</h2>

            <p>
              Access your services, requests, updates,
              and community workspace.
            </p>
          </div>

          {error && (
            <div className="auth-alert auth-alert-error">
              {error}
            </div>
          )}

          <form
            onSubmit={handleLogin}
            className="auth-modern-form"
            autoComplete="on"
          >
            {/* COMMUNITY */}
            <label className="auth-field">
              <span>Community</span>

              <div className="auth-control">
                <Building2 size={18} />

                <select
                  name="community"
                  id="login-community"
                  autoComplete="off"
                  value={tenantId}
                  onChange={(event) =>
                    setTenantId(event.target.value)
                  }
                  required
                >
                  {TENANTS.map((tenant) => (
                    <option
                      key={tenant.id}
                      value={tenant.id}
                    >
                      {tenant.name}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            {/* EMAIL */}
            <label className="auth-field">
              <span>Email address</span>

              <div className="auth-control">
                <Mail size={18} />

                <input
                  type="email"
                  name="email"
                  id="login-email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                />
              </div>
            </label>

            {/* PASSWORD */}
            <label className="auth-field">
              <span>Password</span>

              <div className="auth-control">
                <Lock size={18} />

                <input
                  type="password"
                  name="password"
                  id="login-password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                />
              </div>
            </label>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign In"}

              <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-demo-card">
            <div className="auth-demo-title">
              <ShieldCheck size={17} />
              Demo Credentials
            </div>

            <p>
              <strong>Resident:</strong>{" "}
              resident@example.com
              <span>/</span>
              resident123
            </p>

            <p>
              <strong>Provider:</strong>{" "}
              aquaflow@provider.com
              <span>/</span>
              provider123
            </p>

            <p>
              <strong>Manager:</strong>{" "}
              manager@greenvally.com
              <span>/</span>
              manager123
            </p>
          </div>

          <div className="auth-switch-copy">
            New to CommunityOS?{" "}
            <button
              type="button"
              onClick={onRegister}
            >
              Create an account
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}