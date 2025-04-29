import { signInWithPopup } from "firebase/auth";
import { auth, provider, db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

function Login() {
  const navigate = useNavigate();

  const handleLogin = async () => {
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
        console.log("User added to Firestore");
      } else {
        console.log("User already exists in Firestore");
      }

      localStorage.setItem("userId", user.uid);

      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>🔐 Login Page</h1>
      <button onClick={handleLogin}>Sign in with Google</button>
    </div>
  );
}

export default Login;
