import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/AuthModal.css";
import { Mail, Lock, Phone, User, Calendar, Gift } from "lucide-react";

const AuthModal = ({ onClose, onLogin }) => {
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [shake, setShake] = useState(false);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Signup form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    referal_name: "",
    dob: "",
  });

  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (form.password) {
      const strength = calculatePasswordStrength(form.password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [form.password]);

  const calculatePasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 6) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const showMessage = (text, type = "info") => {
    setMessage({ text, type });
    if (type === "error") {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    showMessage("Creating your account...", "info");

    try {
      const response = await axios.post(
        "https://users.mpdatahub.com/api/user-admin-register",
        {
          name: form.name,
          email: form.email,
          password: form.password,
          mobile: form.mobile,
          referal_name: form.referal_name || "",
          dob: form.dob || "",
        },
      );

      showMessage("Account created successfully! Please login.", "success");

      // Pre-fill login form with registered email
      setTimeout(() => {
        setActiveTab("login");
        setEmail(form.email);
        setPassword("");
        // Reset signup form
        setForm({
          name: "",
          email: "",
          password: "",
          mobile: "",
          referal_name: "",
          dob: "",
        });
      }, 1500);
    } catch (err) {
      showMessage(
        err.response?.data?.message ||
          err.response?.data?.errors?.email?.[0] ||
          "Registration failed. Please check your details.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    showMessage("Authenticating...", "info");

    try {
      const response = await axios.post(
        "https://users.mpdatahub.com/api/user-admin-login",
        {
          email: email,
          password: password,
        },
      );

      const userData = response.data.user || response.data;

      // Create user object with necessary fields
      const user = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
        token: userData.token || response.data.token,
        role: userData.role,
        onboarding: userData.onboarding,
        referal_code: userData.referal_code,
        dob: userData.dob,
        image: `https://ui-avatars.com/api/?name=${userData.name}&background=667eea&color=fff`,
      };

      // Store in localStorage
      localStorage.setItem("mp_user", JSON.stringify(user));
      if (user.token) {
        localStorage.setItem("mp_token", user.token);
      }

      showMessage("Login successful! Welcome back!", "success");

      setTimeout(() => {
        onLogin(user);
        onClose();
      }, 1000);
    } catch (err) {
      showMessage(
        err.response?.data?.message || "Invalid email or password.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength >= 75) return "#10b981";
    if (passwordStrength >= 50) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <motion.div
      className="auth-overlay1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`auth-modal1 ${shake ? "shake" : ""}`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 25 }}
      >
        <div className="auth-left1">
          <img src="/assets/lookit.png" alt="" />
        </div>
        <div className="auth-right1">
          <div className="auth-header1">
            <motion.h2
              key={activeTab}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              {activeTab === "login" ? "Welcome Back!" : "Create Account"}
            </motion.h2>
            <p className="auth-subtitle1">
              {activeTab === "login"
                ? "Login securely with your email and password"
                : "Join thousands of satisfied users"}
            </p>
          </div>

          <div className="auth-tabs1">
            <button
              className={`tab1 ${activeTab === "login" ? "active" : ""}`}
              onClick={() => setActiveTab("login")}
            >
              <Lock size={16} />
              Login
            </button>
            {/* <button
              className={`tab1 ${activeTab === "signup" ? "active" : ""}`}
              onClick={() => setActiveTab("signup")}
            >
              <User size={16} />
              Sign Up
            </button> */}
          </div>

          {message.text && (
            <motion.div
              className={`auth-msg1 ${message.type}`}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              {message.text}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === "signup" && (
              <motion.form
                key="signup"
                className="auth-form1"
                onSubmit={handleSignupSubmit}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
              >
                <div className="form-grid1">
                  <div className="input-group1">
                    <User size={18} className="input-icon1" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      required
                      value={form.name}
                      onChange={handleSignupChange}
                    />
                  </div>

                  <div className="input-group1">
                    <Mail size={18} className="input-icon1" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      required
                      value={form.email}
                      onChange={handleSignupChange}
                    />
                  </div>

                  <div className="input-group1">
                    <Lock size={18} className="input-icon1" />
                    <input
                      type="password"
                      name="password"
                      placeholder="Password (Max 8 characters)"
                      required
                      maxLength={8}
                      value={form.password}
                      onChange={handleSignupChange}
                    />
                  </div>

                  {form.password && (
                    <div className="password-strength1">
                      <div
                        className="strength-bar1"
                        style={{
                          width: `${passwordStrength}%`,
                          backgroundColor: getPasswordStrengthColor(),
                        }}
                      />
                    </div>
                  )}

                  <div className="input-group1">
                    <Phone size={18} className="input-icon1" />
                    <input
                      type="tel"
                      name="mobile"
                      placeholder="Mobile Number"
                      required
                      maxLength={13}
                      value={form.mobile}
                      onChange={handleSignupChange}
                    />
                  </div>

                  <div className="input-group1">
                    <Calendar size={18} className="input-icon1" />
                    <input
                      type="date"
                      name="dob"
                      placeholder="Date of Birth"
                      value={form.dob}
                      onChange={handleSignupChange}
                    />
                  </div>

                  <div className="input-group1">
                    <Gift size={18} className="input-icon1" />
                    <input
                      type="text"
                      name="referal_name"
                      placeholder="Referral Code (Optional)"
                      value={form.referal_name}
                      onChange={handleSignupChange}
                    />
                  </div>
                </div>

                <motion.button
                  className="auth-btn1 primary"
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <div className="spinner1"></div>
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </motion.button>
              </motion.form>
            )}

            {activeTab === "login" && (
              <motion.form
                key="login"
                className="auth-form1"
                onSubmit={handleLoginSubmit}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
              >
                <div className="input-group1">
                  <Mail size={18} className="input-icon1" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="input-group1">
                  <Lock size={18} className="input-icon1" />
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {/* <div className="forgot-password1">
                  <button
                    type="button"
                    className="forgot-link1"
                    onClick={() => {
                      // Add forgot password functionality if needed
                      showMessage("Please contact support to reset your password", "info");
                    }}
                  >
                    Forgot Password?
                  </button>
                </div> */}

                <motion.button
                  className="auth-btn1 primary"
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <div className="spinner1"></div>
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* <button className="close-btn1" onClick={onClose}>
            <X size={20} />
          </button> */}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AuthModal;
