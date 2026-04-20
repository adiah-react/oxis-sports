import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import Leaderboard from "./pages/Leaderboard";

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
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
