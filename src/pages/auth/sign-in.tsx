import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { SignInData } from "../../types/auth";
import { saveUser } from "../../utils/localStorage";
import styles from '../../assets/styles/auth.module.css';

export const SignIn = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formState, setFormState] = useState<SignInData>({
        email: "",
        password: ""
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState({
            ...formState,
            [name]: value
        })
    }

    const handleLogin = async () => {
        try {
            setLoading(true);

            const response = await loginUser(formState)
            if (response) {
                window.alert('Login successful!');
                saveUser({
                    id: response.user.id,
                    username: response.user.username,
                    email: response.user.email,
                    token: response.token
                })
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("Login failed:", error);
            window.alert("Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.signinPage}>
            <h1 className="page-heading">Sign In</h1>
            <form action={handleLogin} className={styles.signinForm}>
                <input type="email" value={formState.email} name="email" placeholder="email" onChange={handleInputChange} />
                <input type="text" value={formState.password} name="password" placeholder="password" onChange={handleInputChange} />

                <button>{ loading ? 'Signing In...' : 'Sign In' }</button>
            </form>
        </div>
    )
}