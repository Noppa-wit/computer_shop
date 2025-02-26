import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

function NavBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const navLinks = [
    { title: "Products", path: "/" },
    { title: "Cart", path: "/cart", icon: <ShoppingCartIcon /> },
    { title: "Order", path: "/order" },
    { title: "Payment", path: "/payment" },
    { title: "Order Tracking", path: "/order-tracking" },
  ];

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    alert("You have logged out successfully.");
    navigate("/");
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#1976d2", boxShadow: 3 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            My Shop
          </Typography>
          <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 2 }}>
            {navLinks.map((link) => (
              <Button
                key={link.title}
                component={NavLink}
                to={link.path}
                color="inherit"
                sx={{
                  textTransform: "none",
                  "&.active": { textDecoration: "underline", fontWeight: "bold" },
                }}
              >
                {link.title}
              </Button>
            ))}
            {user ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography
                  variant="body1"
                  sx={{ color: "white", fontStyle: "italic", fontWeight: "500" }}
                >
                  Role: {user.role}
                </Typography>
                <Button
                  color="inherit"
                  onClick={handleLogout}
                  sx={{
                    textTransform: "none",
                    fontWeight: "bold",
                    backgroundColor: "#e57373",
                    "&:hover": { backgroundColor: "#ef5350" },
                  }}
                >
                  Logout
                </Button>
              </Box>
            ) : (
              <Button
                component={NavLink}
                to="/login"
                color="inherit"
                sx={{
                  textTransform: "none",
                  fontWeight: "bold",
                  backgroundColor: "#81c784",
                  "&:hover": { backgroundColor: "#66bb6a" },
                }}
              >
                Login
              </Button>
            )}
          </Box>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ display: { sm: "none" } }}
          >
            ☰
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{ display: { sm: "none" } }}
      >
        <List>
          {navLinks.map((link) => (
            <ListItem
              button
              key={link.title}
              component={NavLink}
              to={link.path}
              onClick={toggleDrawer(false)}
              sx={{ textAlign: "center" }}
            >
              {link.icon && <IconButton color="inherit">{link.icon}</IconButton>}
              <ListItemText primary={link.title} />
            </ListItem>
          ))}
          {user ? (
            <ListItem button onClick={handleLogout} sx={{ textAlign: "center" }}>
              <ListItemText primary="Logout" />
            </ListItem>
          ) : (
            <ListItem
              button
              component={NavLink}
              to="/login"
              onClick={toggleDrawer(false)}
              sx={{ textAlign: "center" }}
            >
              <ListItemText primary="Login" />
            </ListItem>
          )}
        </List>
      </Drawer>
    </>
  );
}

export default NavBar;
