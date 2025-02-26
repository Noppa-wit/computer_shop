import React, { useState } from "react";
import { TextField, Button, Container, Typography, Box, Tabs, Tab } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginRegister = () => {
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // New state for name
  const [role, setRole] = useState("user"); // New state for role
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setEmail("");
    setPassword("");
    setName(""); // Reset name
    setRole("user"); // Reset role
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });

      if (response.data.message === "Login successful!") {
        alert(`Welcome, ${response.data.name}!`);
        if (response.status === 200) {
          sessionStorage.setItem("user", JSON.stringify(response.data));
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
    }
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post("http://localhost:5000/register", {
        name, // Send name
        email,
        password,
        role, // Send role
      });

      if (response.data.message === "User registered successfully") {
        alert("Registration Successful. Please login.");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          centered
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>
        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mt: 3,
          }}
        >
          <Typography variant="h5" textAlign="center">
            {tabValue === 0 ? "Login" : "Register"}
          </Typography>
          {tabValue === 1 && (
            <TextField
              label="Name"
              type="text"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
          )}
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />
          {tabValue === 1 && (
            <TextField
              label="Role"
              type="text"
              variant="outlined"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              fullWidth
            />
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={tabValue === 0 ? handleLogin : handleRegister}
            fullWidth
          >
            {tabValue === 0 ? "Login" : "Register"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginRegister;
