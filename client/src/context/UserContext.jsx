import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'
import { db, storage } from '../firebase.js';
import { doc, setDoc, updateDoc, getDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// create context
const UserContext = createContext();

// hook to access UserContext
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [pfp, setPfp] = useState(null);

    // check if user is logged in by checking for a JWT token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const userInfo = jwtDecode(token);  // decodes and retrieves user info from JWT
            console.log("Decoded JWT:", userInfo);
            setUser(userInfo);
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

     // update pfp
     const updatePfp = async (file) => {
        console.log('user_id: ', user.user_id)
        if(user && user.user_id) {
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
            } catch (error) {
                console.error("Error uploading profile picture:", error);
            }
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
        <UserContext.Provider value={{ user, setUser, pfp, setPfp, updatePfp, logout, login }}>
            {children}
        </UserContext.Provider>
    );
};
