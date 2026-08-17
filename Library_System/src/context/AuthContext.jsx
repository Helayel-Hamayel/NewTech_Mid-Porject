import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../utils/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Persist user login on page refresh
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setCurrentUser({ id: user.uid, ...userDoc.data() });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login via Firebase Auth & Firestore
  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const uid = userCredential.user.uid;

      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const userData = { id: uid, ...userDoc.data() };
        setCurrentUser(userData);
        return { success: true };
      } else {
        return { success: false, error: "User profile not found in database!" };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Register function to save new member to Auth & Firestore
  async function register(email, password, extraData = {}) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const uid = userCredential.user.uid;

      const newUser = {
        id: uid,
        email: email.toLowerCase(),
        role: "Customer",
        isAdmin: false,
        isStaff: false,
        membershipId: `LIB-M-${Math.floor(100 + Math.random() * 900)}`,
        joinedDate: new Date().toISOString().split("T")[0],
        activeLoansCount: 0,
        ...extraData,
      };

      await setDoc(doc(db, "users", uid), newUser);
      setCurrentUser(newUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  function logout() {
    return signOut(auth);
  }

  const value = {
    currentUser,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export default AuthProvider;
