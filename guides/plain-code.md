```json
// File: backend/package.json
{
  "name": "mern-backend",
  "version": "1.0.0",
  "description": "Backend for MERN stack application",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.4.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.3"
  }
}
```

```javascript
// File: backend/.env.example
// This file should be renamed to .env in production and kept out of version control.
// Example values - replace with your actual ones.

PORT=3001
MONGODB_URI=mongodb://localhost:27017/mernauthdb
JWT_SECRET=your_jwt_secret_key_here
```

```javascript
// File: backend/server.js
require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth"); // Import authentication routes
const profileRoutes = require("./routes/profile"); // Import profile routes

const app = express();
const PORT = process.env.PORT || 3001; // Use port from .env or default to 3001

// Middleware
app.use(cors()); // Enable CORS for all routes, allowing frontend to connect
app.use(express.json()); // Parse JSON request bodies

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes); // Mount authentication routes
app.use("/api", profileRoutes); // Mount profile routes

// Basic route for testing server
app.get("/", (req, res) => {
  res.send("MERN Backend is running!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

```javascript
// File: backend/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // For password hashing

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Ensure usernames are unique
    trim: true, // Remove whitespace from both ends of a string
  },
  password: {
    type: String,
    required: true,
  },
});

// Pre-save hook to hash password before saving a new user
UserSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next();
  } catch (error) {
    next(error); // Pass any errors to the next middleware
  }
});

// Method to compare entered password with hashed password in the database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
```

```javascript
// File: backend/middleware/auth.js
const jwt = require("jsonwebtoken"); // For working with JWTs
const User = require("../models/User"); // Import the User model

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // TODO: Replace with your actual JWT_SECRET from .env

      // Attach user to the request object (excluding password)
      req.user = await User.findById(decoded.id).select("-password");
      next(); // Proceed to the next middleware/route handler
    } catch (error) {
      console.error("Token verification failed:", error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // If no token is provided
  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = protect;
```

```javascript
// File: backend/routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken"); // For generating JWTs
const User = require("../models/User"); // Import the User model

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Basic validation
  if (!username || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  try {
    // Check if user already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user (password hashing handled by pre-save hook in User model)
    const user = await User.create({
      username,
      password,
    });

    // Respond with success message or user info (without password)
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Basic validation
  if (!username || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET, // TODO: Replace with your actual JWT_SECRET from .env
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // Respond with token and user info
    res.json({
      message: "Logged in successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

module.exports = router;
```

```javascript
// File: backend/routes/profile.js
const express = require("express");
const protect = require("../middleware/auth"); // Import the authentication middleware
const User = require("../models/User"); // Import the User model

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private (requires JWT token)
router.get("/profile", protect, async (req, res) => {
  try {
    // req.user is populated by the 'protect' middleware
    const user = await User.findById(req.user.id).select("-password"); // Fetch user data excluding password
    if (user) {
      res.json({
        id: user._id,
        username: user.username,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

module.exports = router;
```

```json
// File: frontend/package.json
{
  "name": "mern-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.23.1",
    "react-scripts": "5.0.1",
    "axios": "^1.7.2"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": ["react-app", "react-app/jest"]
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "tailwindcss": "^3.4.4",
    "postcss": "^8.4.38",
    "autoprefixer": "^10.4.19"
  }
}
```

```javascript
// File: frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
```

```javascript
// File: frontend/postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

```css
// File: frontend/src/index.css
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

/* Custom global styles if needed, otherwise Tailwind handles most */
body {
  margin: 0;
  font-family: "Inter", sans-serif; /* Using Inter font */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  @apply bg-gray-100 p-4; /* Apply basic background and padding using Tailwind */
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New",
    monospace;
}
```

```javascript
// File: frontend/src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Import Tailwind CSS
import App from "./App";
import { AuthProvider } from "./context/AuthContext"; // Import AuthProvider

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* Wrap the App with AuthProvider to make authentication context available */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
```

```javascript
// File: frontend/src/App.js
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
```

```javascript
// File: frontend/src/components/HomePage.js
import React from "react";

function HomePage() {
  return (
    <div className="text-center py-8">
      <h2 className="text-3xl font-semibold text-gray-700 mb-4">
        Welcome to the Home Page!
      </h2>
      <p className="text-gray-600 text-lg">
        This is your empty homepage. Feel free to add content here.
      </p>
    </div>
  );
}

export default HomePage;
```

```javascript
// File: frontend/src/components/LoginForm.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import useAuth hook

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function from AuthContext

  // TODO: Replace with your actual backend API base URL
  const API_BASE_URL = "http://localhost:3001/api";

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(""); // Clear previous errors

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password,
      });

      // Call the login function from AuthContext to update state and localStorage
      login(response.data.token, response.data.user);

      console.log("Login successful:", response.data);
      navigate("/profile"); // Redirect to profile page on successful login
    } catch (err) {
      console.error(
        "Login error:",
        err.response ? err.response.data : err.message
      );
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm max-w-md mx-auto my-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Login
      </h2>
      {error && (
        <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div>
          <label
            htmlFor="username"
            className="block text-gray-700 text-sm font-semibold mb-2 text-left"
          >
            Username:
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-gray-700 text-sm font-semibold mb-2 text-left"
          >
            Password:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
```

```javascript
// File: frontend/src/components/RegisterForm.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // TODO: Replace with your actual backend API base URL
  const API_BASE_URL = "http://localhost:3001/api";

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(""); // Clear previous errors
    setSuccess(""); // Clear previous success messages

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        username,
        password,
      });
      setSuccess(response.data.message || "Registration successful!");
      console.log("Registration successful:", response.data);
      navigate("/login"); // Redirect to login page after successful registration
    } catch (err) {
      console.error(
        "Registration error:",
        err.response ? err.response.data : err.message
      );
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    }
  };

  return (
    <div className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm max-w-md mx-auto my-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Register
      </h2>
      {error && (
        <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
      )}
      {success && (
        <p className="text-green-600 text-sm mb-4 text-center">{success}</p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div>
          <label
            htmlFor="username"
            className="block text-gray-700 text-sm font-semibold mb-2 text-left"
          >
            Username:
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-gray-700 text-sm font-semibold mb-2 text-left"
          >
            Password:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default RegisterForm;
```

```javascript
// File: frontend/src/components/ProfilePage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // Import useAuth hook
import { useNavigate } from "react-router-dom";

function ProfilePage() {
  const { user, token, logout } = useAuth(); // Get user, token, and logout from AuthContext
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // TODO: Replace with your actual backend API base URL
  const API_BASE_URL = "http://localhost:3001/api";

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setError("No token found. Please log in.");
        setLoading(false);
        logout(); // Clear any stale auth state
        navigate("/login"); // Redirect to login
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`, // Send JWT token in Authorization header
          },
        });
        setProfileData(response.data);
        setLoading(false);
      } catch (err) {
        console.error(
          "Error fetching profile:",
          err.response ? err.response.data : err.message
        );
        setError(
          err.response?.data?.message || "Failed to fetch profile data."
        );
        setLoading(false);
        // If token is invalid or expired, log out the user
        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          logout();
          navigate("/login");
        }
      }
    };

    fetchProfile();
  }, [token, logout, navigate]); // Re-run effect if token, logout, or navigate changes

  if (loading) {
    return <p className="text-gray-600 text-center py-4">Loading profile...</p>;
  }

  if (error) {
    return <p className="text-red-600 text-center py-4">{error}</p>;
  }

  return (
    <div className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm max-w-md mx-auto my-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        User Profile
      </h2>
      {profileData ? (
        <div className="text-left text-gray-700">
          <p className="mb-2">
            <strong>Username:</strong> {profileData.username}
          </p>
          <p>
            <strong>User ID:</strong> {profileData.id}
          </p>
          <p className="mt-4 text-green-600">
            This is a protected page, only visible to authenticated users.
          </p>
        </div>
      ) : (
        <p className="text-gray-600 text-center">No profile data available.</p>
      )}
    </div>
  );
}

export default ProfilePage;
```

```javascript
// File: frontend/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";

// Create the Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage for persistence
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // On initial load, check localStorage for existing token and user info
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        // Clear invalid data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []); // Run only once on component mount

  // Function to handle user login
  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem("token", newToken); // Store token in localStorage
    localStorage.setItem("user", JSON.stringify(newUser)); // Store user info in localStorage
  };

  // Function to handle user logout
  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token"); // Remove token from localStorage
    localStorage.removeItem("user"); // Remove user info from localStorage
  };

  // The value provided to consumers of this context
  const authContextValue = {
    isAuthenticated,
    user,
    token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily consume the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
```

```html
// File: frontend/public/index.html

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="MERN Stack Boilerplate Application" />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>My Awesome MERN App</title>
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```
