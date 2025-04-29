// src/pages/EditItinerary.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

const EditItinerary = () => {
  const { id } = useParams();
  const [user] = useAuthState(auth);
  const [trip, setTrip] = useState(null);
  const [formData, setFormData] = useState({
    selectedCity: "",
    days: "",
    budget: "",
    groupType: "",
    activities: [],
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrip = async () => {
      if (!user || !id) return;

      const ref = doc(db, "users", user.uid, "itineraries", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setTrip(data);
        setFormData({
          selectedCity: data.selectedCity,
          days: data.days,
          budget: data.budget,
          groupType: data.groupType,
          activities: data.activities || [],
        });
      } else {
        alert("Trip not found");
        navigate("/manage-trips");
      }
    };

    fetchTrip();
  }, [user, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "days" ? Math.max(1, parseInt(value)) : value,
    }));
  };

  const handleDayChange = (index, newDay) => {
    const updatedActivities = [...formData.activities];
    updatedActivities[index].day = newDay;
    setFormData((prev) => ({ ...prev, activities: updatedActivities }));
  };

  const handleRemoveActivity = (index) => {
    const updated = [...formData.activities];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, activities: updated }));
  };

  const handleSave = async () => {
    try {
      const ref = doc(db, "users", user.uid, "itineraries", id);
      await updateDoc(ref, formData);
      alert("Itinerary updated!");
      navigate("/manage-trips");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update itinerary.");
    }
  };

  if (!trip) return <div style={{ padding: "2rem", color: "#000", backgroundColor: "#e0f7ff", minHeight: "100vh" }}>Loading...</div>;

  return (
    <div style={{ padding: "2rem", color: "#000", backgroundColor: "#e0f7ff", minHeight: "100vh", maxWidth: "700px", margin: "0 auto" }}>
      <h2 style={{ color: "#00bfff", textAlign: "center", marginBottom: "2rem" }}>📝 Edit Itinerary</h2>

      <label>
        Destination:
        <input
          name="selectedCity"
          value={formData.selectedCity}
          readOnly
          style={inputStyle}
        />
      </label>

      <label>
        Days:
        <input
          name="days"
          type="number"
          min="1"
          value={formData.days}
          onChange={handleChange}
          style={inputStyle}
        />
      </label>

      <label>
        Budget:
        <input
          name="budget"
          value={formData.budget}
          readOnly
          style={inputStyle}
        />
      </label>

      <label>
        Group Type:
        <input
          name="groupType"
          value={formData.groupType}
          readOnly
          style={inputStyle}
        />
      </label>

      <h3 style={{ marginTop: "2rem", color: "#00bfff" }}>Activities ({formData.activities.length})</h3>

      {formData.activities.map((activity, index) => (
        <div key={index} style={activityCardStyle}>
          {activity.photoUrl && (
            <img
              src={activity.photoUrl}
              alt={activity.name}
              style={{
                width: "100%",
                height: "160px",
                objectFit: "cover",
                borderRadius: "8px",
                marginBottom: "0.5rem",
              }}
            />
          )}

          <strong>{activity.name}</strong>
          <div style={{ marginTop: "8px" }}>
            Day:
            <select
              value={activity.day}
              onChange={(e) => handleDayChange(index, parseInt(e.target.value))}
              style={selectStyle}
            >
              {[...Array(parseInt(formData.days)).keys()].map((d) => (
                <option key={d + 1} value={d + 1}>
                  Day {d + 1}
                </option>
              ))}
            </select>
          </div>

          <button onClick={() => handleRemoveActivity(index)} style={removeButtonStyle}>
            🗑 Remove
          </button>
        </div>
      ))}

      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button
          onClick={handleSave}
          style={{
            backgroundColor: "#00b894",
            color: "#fff",
            padding: "12px 24px",
            border: "none",
            borderRadius: "10px",
            fontWeight: "bold",
            fontSize: "1.1rem",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
          }}
        >
          💾 Save Changes
        </button>
      </div>
    </div>
  );
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "10px",
  margin: "10px 0 20px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  backgroundColor: "#ffffff",
  color: "#000",
};

const activityCardStyle = {
  backgroundColor: "#ffffff",
  padding: "1rem",
  borderRadius: "12px",
  marginBottom: "1.5rem",
  boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
  textAlign: "center",
};

const removeButtonStyle = {
  backgroundColor: "#e74c3c",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "8px 16px",
  fontWeight: "bold",
  marginTop: "12px",
  cursor: "pointer",
};

const selectStyle = {
  marginLeft: "10px",
  padding: "6px 10px",
  borderRadius: "6px",
  backgroundColor: "#ffffff",
  color: "#000",
  border: "1px solid #ccc",
};

export default EditItinerary;
