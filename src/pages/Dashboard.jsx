import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>📋 Dashboard</h1>
        <img
          src={user.photoURL}
          alt="Profile"
          style={styles.avatar}
        />
        <h2 style={styles.username}>Welcome, {user.displayName}</h2>
        <p style={styles.email}>{user.email}</p>

        <div style={styles.buttonGroup}>
          <button style={styles.button} onClick={logout}>
            🚪 Log out
          </button>

          <button style={styles.button} onClick={() => navigate("/loading")}>
            🧭 Explore Nearby Places
          </button>

          <button style={styles.button} onClick={() => navigate("/manage-trips")}>
            📍 Manage Your Itineraries
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: "#e3f2fd", // light blue background
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
  },
  container: {
    backgroundColor: "#ffffff", // white card
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    textAlign: "center",
    maxWidth: "400px",
    width: "90%",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "1rem",
    color: "#01579b",
  },
  avatar: {
    borderRadius: "50%",
    width: "120px",
    height: "120px",
    marginBottom: "1rem",
    objectFit: "cover",
  },
  username: {
    fontSize: "1.5rem",
    marginBottom: "0.5rem",
    color: "#333",
  },
  email: {
    fontSize: "1rem",
    marginBottom: "2rem",
    color: "#777",
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  button: {
    backgroundColor: "#01579b",
    color: "white",
    padding: "12px 20px",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
};

export default Dashboard;
