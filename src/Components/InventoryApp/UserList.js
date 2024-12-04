import React, { useState, useEffect } from 'react';
import { database } from '../../firebaseConfig';
import { ref, get } from 'firebase/database';

const ViewUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userRef = ref(database, 'users/');
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const usersData = snapshot.val();
          const usersArray = Object.values(usersData);
          setUsers(usersArray);
        } else {
          setErrorMessage('No users found.');
        }
      } catch (error) {
        setErrorMessage('Error fetching users. Please try again.');
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <p>Loading users...</p>;
  }

  return (
    <div className="view-users-container">
      <h2>View Users</h2>
      {errorMessage ? (
        <p className="error">{errorMessage}</p>
      ) : (
        <ul>
          {users.map((user, index) => (
            <li key={index}>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ViewUsers;
