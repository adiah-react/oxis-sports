import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AdminLayout } from "./components/AdminLayout";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import AdminDashboard from "./pages/AdminDashboard";
import AllPoints from "./pages/AllPoints";
import AwardPoints from "./pages/AwardPoints";
import CreateEvent from "./pages/CreateEvent";
import CreateHouse from "./pages/CreateHouse";
import CreateStudent from "./pages/CreateStudent";
import { HouseDetail } from "./pages/HouseDetail";
import Leaderboard from "./pages/Leaderboard";
import Login from "./pages/Login";
import { ManageEvents } from "./pages/ManageEvents";
import ManageHouses from "./pages/ManageHouses";
import ManageStudents from "./pages/ManageStudents";
import Places from "./pages/Places";

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
            path="/house/:id"
            element={
              <>
                <Navbar />
                <HouseDetail />
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
            <Route path="houses/create" element={<CreateHouse />} />
            <Route path="houses/:editingId/edit" element={<CreateHouse />} />

            <Route path="students" element={<ManageStudents />} />
            <Route path="students/create" element={<CreateStudent />} />
            <Route
              path="students/:editingId/edit"
              element={<CreateStudent />}
            />

            <Route path="events" element={<ManageEvents />} />
            <Route path="events/create" element={<CreateEvent />} />
            <Route path="events/:editingId/edit" element={<CreateEvent />} />
            <Route path="award" element={<AwardPoints />} />
            <Route path="places" element={<Places />} />
            <Route path="points" element={<AllPoints />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
