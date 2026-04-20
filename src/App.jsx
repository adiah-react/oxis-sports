import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AdminLayout } from "./components/AdminLayout";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import AdminDashboard from "./pages/AdminDashboard";
import AwardPoints from "./pages/AwardPoints";
import Leaderboard from "./pages/Leaderboard";
import Login from "./pages/Login";
import { ManageEvents } from "./pages/ManageEvents";
import ManageHouses from "./pages/ManageHouses";
import ManageStudents from "./pages/ManageStudents";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <Leaderboard />
              </>
            }
          />
          <Route
            path="/login"
            element={
              <>
                <Navbar />
                <Login />
              </>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="houses" element={<ManageHouses />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="events" element={<ManageEvents />} />
            <Route path="award" element={<AwardPoints />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
