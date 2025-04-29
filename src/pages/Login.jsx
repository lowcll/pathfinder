import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, provider, db } from "../firebase/firebase";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
        });
      }

      localStorage.setItem("userId", user.uid);
      navigate("/dashboard");
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  const validatePassword = (password) => {
    const capital = /[A-Z]/.test(password);
    const number = /\d/.test(password);
    const symbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return capital && number && symbol;
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      if (isRegistering) {
        if (!validatePassword(password)) {
          return setErrorMsg(
            "Password must include a capital letter, number, and symbol."
          );
        }

        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCred.user.uid), {
          email,
          createdAt: serverTimestamp(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      localStorage.setItem("userId", auth.currentUser.uid);
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h1>🔐 {isRegistering ? "Register" : "Login"} Page</h1>

      <form onSubmit={handleEmailLogin} style={{ maxWidth: "300px", margin: "auto" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

        <button type="submit" style={buttonStyle}>
          {isRegistering ? "Create Account" : "Login"}
        </button>
      </form>

      <p>
        {isRegistering ? "Already have an account?" : "Need to register?"}{" "}
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          style={{ background: "none", color: "blue", border: "none", cursor: "pointer" }}
        >
          {isRegistering ? "Log In" : "Register"}
        </button>
      </p>

      <hr style={{ margin: "1.5rem 0" }} />
      <button onClick={handleGoogleLogin} style={buttonStyle}>
        🔐 Sign in with Google
      </button>
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "10px",
  margin: "10px 0",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  width: "100%",
  padding: "10px",
  border: "none",
  borderRadius: "6px",
  backgroundColor: "#007bff",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
  marginTop: "10px",
};

export default Login;
