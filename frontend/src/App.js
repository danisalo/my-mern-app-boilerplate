import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import HomePage from "./components/HomePage";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ProfilePage from "./components/ProfilePage";
import { useAuth } from "./context/AuthContext"; // Import useAuth hook

function App() {
  const { isAuthenticated, logout } = useAuth(); // Get authentication status and logout function from context

  return (
    <Router>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 font-inter">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
            My Awesome MERN App
          </h1>

          <nav className="bg-blue-600 p-4 rounded-lg shadow-md mb-8">
            <ul className="flex justify-center space-x-6">
              <li>
                <Link
                  to="/"
                  className="text-white text-lg font-medium hover:text-blue-200 transition duration-300"
                >
                  Home
                </Link>
              </li>
              {!isAuthenticated ? (
                <>
                  <li>
                    <Link
                      to="/login"
                      className="text-white text-lg font-medium hover:text-blue-200 transition duration-300"
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register"
                      className="text-white text-lg font-medium hover:text-blue-200 transition duration-300"
                    >
                      Register
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      to="/profile"
                      className="text-white text-lg font-medium hover:text-blue-200 transition duration-300"
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={logout}
                      className="bg-red-500 text-white text-lg font-medium py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>

          <main className="bg-gray-50 p-8 rounded-lg shadow-inner">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              {/* Protected Route: Navigate to login if not authenticated */}
              <Route
                path="/profile"
                element={
                  isAuthenticated ? (
                    <ProfilePage />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;