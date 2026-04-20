import { useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { SignInData } from "../../types/auth";
import { saveUser } from "../../utils/localStorage";
import styles from '../../assets/styles/auth.module.css';

export const SignIn = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formState, setFormState] = useState<SignInData>({
        email: "",
        password: ""
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setError(null);
        setFormState({ ...formState, [name]: value })
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.email || !formState.password) {
            setError("Please fill in all fields.");
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const response = await loginUser(formState)
            if (response) {
                saveUser({
                    id: response.user.id,
                    username: response.user.username,
                    email: response.user.email,
                    token: response.token
                })
                navigate('/dashboard');
            }
        } catch (err: any) {
            console.error("Login failed:", err);
            setError(err?.response?.data?.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.authPage}>
            <div className={styles.authCard}>
                {/* Brand */}
                <div className={styles.brandArea}>
                    <div className={styles.brandIcon}>
                        <svg viewBox="0 0 24 24" width="30" height="30" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </div>
                    <span className={styles.brandName}>ChatApp</span>
                </div>

                <h1 className={styles.pageTitle}>Welcome back</h1>
                <p className={styles.pageSubtitle}>Sign in to continue your conversations</p>

                {/* Error banner */}
                {error && (
                    <div className={styles.errorBanner}>
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className={styles.authForm}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Email address</label>
                        <input
                            id="signin-email"
                            type="email"
                            name="email"
                            value={formState.email}
                            placeholder="you@example.com"
                            onChange={handleInputChange}
                            className={styles.fieldInput}
                            autoComplete="email"
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Password</label>
                        <input
                            id="signin-password"
                            type="password"
                            name="password"
                            value={formState.password}
                            placeholder="••••••••"
                            onChange={handleInputChange}
                            className={styles.fieldInput}
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        id="signin-submit"
                        type="submit"
                        className={styles.submitBtn}
                        disabled={loading}
                    >
                        {loading && <span className={styles.spinner}></span>}
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className={styles.linkRow}>
                    Don't have an account?
                    <Link to="/auth/sign-up">Create one</Link>
                </div>
            </div>
        </div>
    )
}