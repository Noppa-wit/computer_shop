import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const [selectedCartItem, setSelectedCartItem] = useState(null);
  const user = JSON.parse(sessionStorage.getItem("user"));
  const navigate = useNavigate();

  

  // Fetch the user's cart data
  const getData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/cart?id=${user.id}`);
      
      // Use Promise.all to wait for all async operations to complete
      const productData = await Promise.all(
        response.data.map(async (item) => {
          const p = await axios.get(`http://localhost:5000/products?id=${item.products_id}`);
          return {
            cart_id: item.cart_id,
            quantity: item.quantity,
            ...p.data[0],
          };
        })
      );

      setCart(productData);
      console.log(productData); // This will log the array of product data after all promises resolve

    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  };

  const handleDeleteItem = async (cartId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/cart?cart_id=${cartId}`);

      if (response.status === 200) {
        getData(); // Refresh cart data after removal
        alert(response.data.message || "Item removed from cart successfully!");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to remove item from cart. Please try again.");
    }
  };

  const handleOpenRemoveDialog = (cartItem) => {
    setSelectedCartItem(cartItem);
    setOpenRemoveDialog(true);
  };

  const handleCloseRemoveDialog = () => {
    setOpenRemoveDialog(false);
    setSelectedCartItem(null);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        Your Cart
      </Typography>
      <Box sx={{justifySelf:"right",alignSelf:"rigth"}}>
        <Button variant="contained" sx={{mr:"0px",ml:"auto"}} onClick={()=>{
            navigate('/payment');
        }}>
          check out
        </Button>
      </Box>
      <Grid container spacing={4}>
        {cart.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.cart_id}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <CardMedia
                component="img"
                image={"./images/" + item.image_url} // Corrected this line
                alt={item.name} // Corrected this line
                height="200"
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  จำนวน : {item.quantity}
                </Typography>
                <Typography variant="body1" color="text.primary" sx={{ mt: 1 }}>
                  ${item.price} บาท
                </Typography>
                <Typography variant="body1" color="text.primary" sx={{ mt: 1 }}>
                  ราคาทั้งหมด ${item.price * item.quantity}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={() => handleOpenRemoveDialog(item)}
                >
                  Remove from Cart
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>


      {/* Dialog to confirm removal */}
      <Dialog open={openRemoveDialog} onClose={handleCloseRemoveDialog}>
        <DialogTitle>Confirm Removal</DialogTitle>
        <DialogContent>
          <Typography variant="h6">{`Are you sure you want to remove ${selectedCartItem?.name} from your cart?`}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemoveDialog} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleDeleteItem(selectedCartItem.cart_id);
              handleCloseRemoveDialog();
            }}
            variant="contained"
            color="primary"
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Cart;
