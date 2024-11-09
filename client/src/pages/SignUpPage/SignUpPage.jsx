import React, { useState } from 'react';
import styles from './SignUpPage.module.css';
import Navbar from '../../components/Navbar/Navbar';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../../api';

function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      username: firstName, // let username be first name for now
      email,
      password,
      first_name: firstName,
      last_name: lastName
    };

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Account created successfully!');
        console.log('User created:', data); 
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create account');
      }
    } catch (err) {
      console.log('Error:', err);
      setError('An error occurred while creating your account.');
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles['signup-container']}>
        <h1 className={styles['title']}>Welcome to <span className={styles['yellow-text']}>MovieMuse</span></h1>
        <p className={styles['subtitle']}>Create your account and start posting!</p>

        <form className={styles['form']} onSubmit={handleSubmit}>
          <div className={styles['name-fields']}>
            <input
              type="text"
              placeholder="First Name"
              className={styles['input-field']}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Last Name"
              className={styles['input-field']}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
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

          <button type="submit" className={styles['signup-button']}>
            Sign Up
          </button>
        </form>

        <p className={styles['login-text']}>
          Already have an account? <Link to="/login" className={styles['login-link']}>Log in</Link>
        </p>
      </div>
    </>
  );
}

export default SignUpPage;
