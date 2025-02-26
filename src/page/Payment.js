import React, { useState, useEffect } from "react";
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  CircularProgress, 
  Grid, 
  Card, 
  CardContent, 
  Divider, 
  CardMedia // Add this import
} from "@mui/material";
import axios from "axios";
import dayjs from 'dayjs';


const Payment = () => {
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const user = JSON.parse(sessionStorage.getItem("user"));

  const getDataP = async () => {
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
      calculateTotal(productData); // Call function to calculate total price
      console.log(productData); // This will log the array of product data after all promises resolve

    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  };

  useEffect(() => {
    getDataP();
  }, []);

  // Function to calculate the total price
  const calculateTotal = (productData) => {
    const total = productData.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    setTotalPrice(total);
  };

  const completePayment = async () => {
    setLoading(true);
    try {
      const res1 = await axios.post("http://localhost:5000/orders", {
        users_id:user?.id, 
        total_amount:totalPrice.toFixed(2), 
        status : "pending",
      });


      const orderId = res1.data.orderID
      console.log(res1)
      console.log(orderId)
      cart.map(async (item)=>{
        const res2 = await axios.put(`http://localhost:5000/cart?order_id=${orderId}&cartId=${item.cart_id}&old_price=${item.price}`);
      })
      
      // await axios.post("http://localhost:3000/payments", {
      //   orders_id : "", 
      //   payment_method : paymentMethod, 
      //   payment_date : dayjs(),
      //   status : "pending"
      // });
      alert("Payment successful");
    } catch (error) {
      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Complete Payment
      </Typography>

      {/* Cart Item Details */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Cart Details
        </Typography>
        {cart.map((item) => (
          <Card key={item.cart_id} sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <CardMedia
                  component="img"
                  image={"./images/" + item.image_url} // Corrected this line
                  alt={item.name} // Corrected this line
                  height="200"
                />
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    Price: ${item.price} x {item.quantity} = ${parseFloat(item.price) * item.quantity}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
        <Divider sx={{ mb: 2 }} />
        <Typography variant="h6" align="right">
          Total Price: ${totalPrice.toFixed(2)}
        </Typography>
      </Box>

      {/* Payment method selection */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Payment Method</InputLabel>
        <Select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          label="Payment Method"
        >
          <MenuItem value="Credit Card">Credit Card</MenuItem>
          <MenuItem value="PayPal">PayPal</MenuItem>
          <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
        </Select>
      </FormControl>

      {/* Payment button */}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={completePayment}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} color="secondary" /> : "Complete Payment"}
      </Button>
    </Container>
  );
};

export default Payment;
