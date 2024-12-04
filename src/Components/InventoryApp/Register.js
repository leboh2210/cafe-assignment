import React, { useState } from 'react';
import { auth, database } from '../../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import './Register.css';

const Register = ({ setIsRegistering, setLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [user, setUser] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store username and email in the Realtime Database under the user's UID
      await set(ref(database, 'users/' + user.uid), {
        username,
        email,
      });

      setSuccessMessage('Registration successful! Please log in.');
      setIsRegistered(true);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('This email is already registered. Please use a different one.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('The password is too weak. It must be at least 6 characters long.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('The email address is not valid. Please check your email.');
      } else {
        setErrorMessage('Registration failed. Please try again.');
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch the user's username from the database after successful login
      const userRef = ref(database, 'users/' + user.uid);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        setUser(snapshot.val().username); // Set the username from the database
      }

      setLoggedIn(true);
      setIsRegistering(false);
      setSuccessMessage('Login successful!');
    } catch (error) {
      setErrorMessage('Login failed. Please check your email and password.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setLoggedIn(false);
      setIsRegistered(false);
      setEmail('');
      setPassword('');
      setUsername('');
      setSuccessMessage('');
      setErrorMessage('');
      setUser(null);
    } catch (error) {
      setErrorMessage('Error logging out. Please try again.');
    }
  };

  return (
    <div className="register-container">
      <h2>{isRegistered ? 'Login' : 'Register'}</h2>

      {!isRegistered ? (
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Register</button>
        </form>
      ) : (
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Log In</button>
        </form>
      )}

      {errorMessage && <p className="error">{errorMessage}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      {user && <p>Welcome, {user}!</p>}

      <div className="toggle-form">
        {!isRegistered ? (
          <p>Already have an account? <span onClick={() => setIsRegistered(true)} className="toggle-link">Login here</span></p>
        ) : (
          <p>Don't have an account? <span onClick={() => setIsRegistered(false)} className="toggle-link">Register here</span></p>
        )}
      </div>

      {isRegistered && (
        <div>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default Register;
