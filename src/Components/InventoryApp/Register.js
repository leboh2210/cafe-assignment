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
  const [isRegistered, setIsRegistered] = useState(false);
  const [user, setUser] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await set(ref(database, 'users/' + user.uid), {
        username,
        email,
      });

      setSuccessMessage('Registration successful! Please log in.');
      setIsRegistered(true);
    } catch (error) {
      if (error.code === 'auth/weak-password') {
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
      const userRef = ref(database, 'users');
      const snapshot = await get(userRef);
      let foundUser = null;

      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        if (data.username === username) {
          foundUser = { ...data, uid: childSnapshot.key };
        }
      });

      if (foundUser) {
        await signInWithEmailAndPassword(auth, foundUser.email, password);
        setUser(foundUser.username);
        setLoggedIn(true);
        setIsRegistering(false);
        setSuccessMessage('Login successful!');
      } else {
        setErrorMessage('User not found. Please check your username or register first.');
      }
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        setErrorMessage('Incorrect password. Please try again.');
      } else if (error.code === 'auth/user-not-found') {
        setErrorMessage('No user found with this username. Please register.');
      } else {
        setErrorMessage('Login failed. Please check your username and password.');
      }
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
