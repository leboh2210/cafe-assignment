import React, { useState } from 'react';
import './Login.css';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, database } from '../../firebaseConfig';
import { ref, get } from 'firebase/database';

const Login = ({ setLoggedIn, setIsRegistering, setActiveTab }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userRef = ref(database, 'users/');
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const users = snapshot.val();
        const user = Object.values(users).find((user) => user.username.trim().toLowerCase() === username.trim().toLowerCase());

        if (user) {
          const userEmail = user.email;

          try {
            await signInWithEmailAndPassword(auth, userEmail, password);

            setLoggedIn(true);
            setActiveTab('add-products');
            setErrorMessage('');
          } catch (authError) {
            console.error('Authentication error:', authError);
            if (authError.code === 'auth/wrong-password') {
              setErrorMessage('Incorrect password. Please try again.');
            } else if (authError.code === 'auth/user-not-found') {
              setErrorMessage('No user found with this email. Please check your username and password.');
            } else {
              setErrorMessage('Error logging in. Please try again.');
            }
          }
        } else {
          setErrorMessage('Username not found. Please check your username or register.');
        }
      } else {
        setErrorMessage('No users found in the database.');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setErrorMessage('Error fetching user data. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>

      {errorMessage && <p className="error">{errorMessage}</p>}

      <p>
        Don't have an account?{' '}
        <span onClick={() => setIsRegistering(true)} className="toggle-link">Register here</span>
      </p>
    </div>
  );
};

export default Login;
