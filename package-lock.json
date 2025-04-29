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
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: "center", color: "#007bff" }}>
          {isRegistering ? "Create an Account" : "Welcome Back 👋"}
        </h2>

        <form onSubmit={handleEmailLogin}>
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

          {errorMsg && <p style={{ color: "red", fontSize: "14px" }}>{errorMsg}</p>}

          <button type="submit" style={buttonStyle}>
            {isRegistering ? "Register" : "Log In"}
          </button>
        </form>

        <p style={{ marginTop: "1rem", fontSize: "14px" }}>
          {isRegistering ? "Already have an account?" : "Need to register?"}{" "}
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            style={{
              background: "none",
              color: "#007bff",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {isRegistering ? "Log In" : "Register"}
          </button>
        </p>

        <hr style={{ margin: "1.5rem 0" }} />

        <button onClick={handleGoogleLogin} style={{ ...buttonStyle, backgroundColor: "#db4437" }}>
          🔐 Sign in with Google
        </button>
      </div>
    </div>
  );
}

const pageStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  backgroundColor: "#e6f4ff",
};

const cardStyle = {
  backgroundColor: "#fff",
  padding: "2rem",
  borderRadius: "12px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
  width: "100%",
  maxWidth: "400px",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  margin: "10px 0",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "14px",
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
