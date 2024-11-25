import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'
import { db, storage } from '../firebase.js';
import { doc, setDoc, updateDoc, getDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import API_BASE_URL from '../api.jsx';

// create context
const UserContext = createContext();

// hook to access UserContext
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [pfp, setPfp] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    // check if user is logged in by checking for a JWT token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const userInfo = jwtDecode(token);  // decodes and retrieves user info from JWT
            console.log("Decoded JWT:", userInfo);
            setUser(userInfo);
            checkAdminStatus(); // Check admin status upon login
        }
    }, []);

    // Function to check admin status
const checkAdminStatus = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found in localStorage');
    return;
  }

  console.log('Checking admin status with token:', token);

  try {
    const response = await fetch(`${API_BASE_URL}/check-admin`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('Admin status endpoint response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('Admin status response data:', data);
      setIsAdmin(data.is_admin); // Store admin status in state
      console.log('Admin status updated in state:', data.is_admin);
    } else {
      console.error(
        'Failed to check admin status. Response:',
        await response.text()
      );
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
  }
};

// useEffect to check admin status on load
useEffect(() => {
  const token = localStorage.getItem('token');
  console.log('Checking admin status on mount. Token:', token);

  if (token) {
    checkAdminStatus();
  } else {
    console.warn('No token found in localStorage on mount.');
  }
}, []);


    // log in and store user info
    const login = (userData, token) => {
        localStorage.setItem('token', token);
        setUser(userData);
    };

    // log out and clear user info
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

  // update pfp and return the downloadURL
  const updatePfp = async (file) => {
    console.log('user_id: ', user.user_id);
    if (user && user.user_id) {
      const userId = String(user.user_id);
      const storageRef = ref(storage, `profilePictures/${userId}`);

      try {
        // Upload the file to Firebase Storage
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        console.log("Uploaded profile picture:", downloadURL);

        // Reference to the user's document in Firestore
        const userDocRef = doc(db, 'user_profiles', userId); // Use user_id as the document ID

        // Check if the user's document exists
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          // If the document exists, update the profile picture URL
          await updateDoc(userDocRef, { profilePicture: downloadURL });
          console.log("Profile picture URL updated in Firestore");
        } else {
          // If the document doesn't exist, create a new document with the profile picture URL
          await setDoc(userDocRef, { profilePicture: downloadURL });
          console.log("New user document created with profile picture URL");
        }

        return downloadURL; // Return the downloadURL for use in postProfile
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        return null;
      }
    }
  };
     


    // Update SQL DB
  const postProfile = async (image_url) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/update_profile_picture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ image_url }), // Pass the image_url directly
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Profile picture updated successfully:', data);
      } else {
        console.log('Error updating profile picture:', response.statusText);
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

    useEffect(() => {
        // Fetch profile picture from Firestore on mount 
        const fetchPfp = async () => {
          if (user) {
            const userId = String(user.user_id);
            const userDocRef = doc(db, 'user_profiles', userId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              setPfp(userDoc.data().profilePicture);
            }
          }
        };
        fetchPfp();
      }, [user]);



    return (
        <UserContext.Provider value={{ user, setUser, pfp, setPfp, updatePfp, logout, login, postProfile, isAdmin }}>
            {children}
        </UserContext.Provider>
    );
};
