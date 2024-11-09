import React, { useState } from 'react';
import styles from './LoginPage.module.css';
import Navbar from '../../components/Navbar/Navbar';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { jwtDecode } from 'jwt-decode'

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useUser();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        try { 
            const response = await fetch('http://localhost:8000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.token) {
                setSuccess(true);
                
                const userData = jwtDecode(data.token);
                login(userData, data.token); // update the user context

                console.log('Login successful:', data);
                navigate("/movies"); // redirect to /movies after successful login
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            console.error('Error during login:', err);
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <>
            <Navbar />
            <div className={styles['login-container']}>
                <h1 className={styles['title']}>Welcome to <span className={styles['yellow-text']}>MovieMuse!</span></h1>

                <form className={styles['form']} onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email Address"
                        className={styles['input-field']}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className={styles['input-field']}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button type="submit" className={styles['login-button']}>
                        Log in
                    </button>
                </form>

                {error && <p className={styles['error-text']}>{error}</p>}
                {success && <p className={styles['success-text']}>Login successful!</p>}

                <p className={styles['signup-text']}>
                    Don't have an account? <Link to="/signup" className={styles['signup-link']}>Sign up!</Link>
                </p>
            </div>
        </>
    );
}

export default LoginPage;
