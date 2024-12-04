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
      // Query the 'users' node in the Realtime Database to find the user by username
      const userRef = ref(database, 'users/');
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        // Retrieve all users and find the user by username
        const users = snapshot.val();
        const user = Object.values(users).find((user) => user.username === username);

        if (user) {
          // Sign in the user using the email and password from the database
          await signInWithEmailAndPassword(auth, user.email, password);
          
          // Set logged-in state to true
          setLoggedIn(true);
          
          // Redirect to 'add-products' tab after login
          setActiveTab('add-products');
          
          setErrorMessage('');  // Clear any previous error message
        } else {
          setErrorMessage('Username not found.');
        }
      } else {
        setErrorMessage('No users found.');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/wrong-password') {
        setErrorMessage('Incorrect password. Please try again.');
      } else if (error.code === 'auth/user-not-found') {
        setErrorMessage('User not found.');
      } else {
        setErrorMessage('Error logging in. Please try again.');
      }
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
        <button onClick={() => setIsRegistering(true)}>Register here</button>
      </p>
    </div>
  );
};

export default Login;
