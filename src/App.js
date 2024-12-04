import React, { useState, useEffect } from "react";
import './App.css';
import InventoryApp from './Components/InventoryApp/InventoryApp';  
import { database } from './firebaseConfig';  

import { ref, onValue } from "firebase/database";  

function App() {
  const [data, setData] = useState([]); 

  useEffect(() => {
    
    const collectionRef = ref(database, "your_collection");

    const fetchData = () => {
      onValue(collectionRef, (snapshot) => {
        const dataItem = snapshot.val();
        
        if (dataItem) {
          const displayItem = Object.values(dataItem);  
          setData(displayItem); 
        }
      });
    };

    fetchData();
  }, []); 

  return (
    <div className="App">
      <h1>Data from Firebase Database:</h1>
      <ul>
        {data.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      
      <InventoryApp />  
    </div>
  );
}

export default App;
