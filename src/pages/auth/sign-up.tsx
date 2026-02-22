import { useState } from "react"
import { SignUpData } from "../../types/auth";
import { registerUser } from "../../services/authService";
import { saveUser } from "../../utils/localStorage";
import { useNavigate } from "react-router-dom";
import styles from '../../assets/styles/auth.module.css';

export const Signup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<Boolean>(false);
    const [formState, setFormState] = useState<SignUpData>({
        username: "",
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

    const handleSignup = async () => {
        try {
            setLoading(true);

            const response = await registerUser(formState);
            console.log("Signup response:", response);
            if (response) {
                window.alert('Signup successful! Please sign in.');
                saveUser({
                    id: response.user.id,
                    username: response.user.username,
                    email: response.user.email,
                    token: response.token
                })
                navigate('/');
            }
        } catch (error) {
            console.error("Signup failed:", error);
            window.alert("Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.signupPage}>
            <h1 className="page-heading">Sign Up</h1>
            <form action={handleSignup} className={styles.signupForm}>
                <input type="text" value={formState.username} name="username" placeholder="username" onChange={handleInputChange} />
                <input type="email" value={formState.email} name="email" placeholder="email" onChange={handleInputChange} />
                <input type="text" value={formState.password} name="password" placeholder="password" onChange={handleInputChange} />

                <button type="submit">{loading ? 'Signing Up...' : 'Sign Up'}</button>
            </form>
        </div>
    )
}