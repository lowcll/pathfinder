import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DiscoverPage from "./pages/DiscoverPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import Navbar from "./components/Navbar";
import LoadingPage from "./pages/LoadingPage";
import TripForm from "./pages/TripForm";
import TripLoadingPage from "./pages/TripLoadingPage";
import ItineraryPage from "./pages/ItineraryPage";
import useLoadGoogleMaps from "./hooks/useLoadGoogleMaps";
import ManageTrips from './pages/ManageTrips';
import EditItinerary from "./pages/EditItinerary";
import BookHotelPage from "./pages/BookHotelPage";
import BookFlightPage from "./pages/BookFlightPage";
import TripSummaryPage from "./pages/TripSummaryPage";
import ViewSavedTrip from "./pages/ViewSavedTrip";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";


const GOOGLE_API_KEY = "AIzaSyCQAuHUG7YwVN9RWq4yq2YgIaVWI686fxM";

function App() {
  const mapsLoaded = useLoadGoogleMaps(GOOGLE_API_KEY, ["places"]);

  if (!mapsLoaded) return <p style={{ padding: "2rem" }}>Loading...</p>;

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/plan-trip" element={<TripForm />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/trip-loading" element={<TripLoadingPage />} />
        <Route path="/loading" element={<LoadingPage />} />
        <Route
          path="/discover"
          element={
            <ProtectedRoute>
              <DiscoverPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/itinerary"
          element={
            <ProtectedRoute>
              <ItineraryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-trips"
          element={
            <ProtectedRoute>
              <ManageTrips />
            </ProtectedRoute>
          }
        />
        <Route path="/edit-itinerary/:id" element={<EditItinerary />} />
        <Route
          path="/book-hotel"
          element={
            <ProtectedRoute>
              <BookHotelPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-flight"
          element={
            <ProtectedRoute>
              <BookFlightPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trip-summary"
          element={
            <ProtectedRoute>
              <TripSummaryPage />
            </ProtectedRoute>
          }
        />
        <Route path="/view-trip" element={<ViewSavedTrip />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        </Routes>
    </>
  );
}

export default App;
