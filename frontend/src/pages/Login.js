import React, { useContext, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { AuthContext } from "../AuthContext";
const API_URL =  "https://vacholink.onrender.com" || process.env.REACT_APP_API_URL ;

export default function Login() {
  const { login } = useContext(AuthContext);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle Google login
  const handleGoogleSuccess = async (cred) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/google`, {
        credential: cred.credential,
      });
      login(res.data.user, res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || "Google login failed");
    }
  };

  // Send OTP for email verification
  const handleSendOtp = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const res = await axios.post(`${API_URL}/api/auth/send-otp`, { email });
      
      if (res.data.success) {
        setOtpSent(true);
        alert("OTP sent to your email!");
        
        // In development, show OTP in console
        if (res.data.otp) {
          console.log("OTP (dev):", res.data.otp);
        }
      } else {
        setError(res.data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !otp) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Step 1: Verify OTP
      const verifyRes = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email,
        otp
      });

      if (!verifyRes.data.success) {
        setError("Invalid or expired OTP");
        setLoading(false);
        return;
      }

      // Step 2: Register user
      const registerRes = await axios.post(`${API_URL}/api/auth/register`, {
        name,
        email,
        password
      });

      if (registerRes.data.success) {
        login(registerRes.data.user, registerRes.data.token);
      } else {
        setError(registerRes.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle email/password login
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      if (res.data.success) {
        login(res.data.user, res.data.token);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: 400, 
      margin: "50px auto", 
      padding: 30, 
      borderRadius: 10, 
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)" 
    }}>
      <h2 style={{ textAlign: "center", marginBottom: 30 }}>
        {isRegister ? "Create Account" : "Login to Chat App"}
      </h2>

      {error && (
        <div style={{ 
          backgroundColor: "#ffe6e6", 
          color: "#cc0000", 
          padding: "10px 15px", 
          borderRadius: 5, 
          marginBottom: 20 
        }}>
          {error}
        </div>
      )}

      
      <form onSubmit={isRegister ? handleRegister : handleLogin}>
        {isRegister && (
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5 }}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              style={{ width: "100%", padding: 10, borderRadius: 5, border: "1px solid #ddd" }}
              required
            />
          </div>
        )}

        <div style={{ marginBottom: 15 }}>
          <label style={{ display: "block", marginBottom: 5 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            style={{ width: "100%", padding: 10, borderRadius: 5, border: "1px solid #ddd" }}
            required
          />
        </div>

        {isRegister && otpSent && (
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5 }}>OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              style={{ width: "100%", padding: 10, borderRadius: 5, border: "1px solid #ddd" }}
              required
            />
            <small style={{ display: "block", marginTop: 5, color: "#666" }}>
              Check your email for the OTP
            </small>
          </div>
        )}

        <div style={{ marginBottom: 15 }}>
          <label style={{ display: "block", marginBottom: 5 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            style={{ width: "100%", padding: 10, borderRadius: 5, border: "1px solid #ddd" }}
            required
          />
        </div>

        {isRegister ? (
          <>
            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: 12,
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: 5,
                  cursor: "pointer",
                  marginBottom: 10
                }}
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: 12,
                  backgroundColor: "#2196F3",
                  color: "white",
                  border: "none",
                  borderRadius: 5,
                  cursor: "pointer",
                  marginBottom: 10
                }}
              >
                {loading ? "Registering..." : "Register"}
              </button>
            )}
          </>
        ) : (
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 12,
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
              marginBottom: 10
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        )}
      </form>

      <div style={{ textAlign: "center", margin: "20px 0" }}>
        <span style={{ color: "#666" }}>OR</span>
      </div>


      <div style={{ marginBottom: 20 }}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError("Google login failed")}
          text={isRegister ? "signup_with" : "continue_with"}
          theme="outline"
          size="large"
          width="100%"
        />
      </div>

      
      <div style={{ textAlign: "center" }}>
        <button
          onClick={() => {
            setIsRegister(!isRegister);
            setError("");
            setOtpSent(false);
            setOtp("");
          }}
          style={{
            background: "none",
            border: "none",
            color: "#2196F3",
            cursor: "pointer",
            textDecoration: "underline"
          }}
        >
          {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
        </button>
      </div>
    </div>
  );
}