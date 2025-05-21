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