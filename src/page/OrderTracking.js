import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  CircularProgress,
  CardMedia,
  Divider,MenuItem, Select, FormControl, InputLabel
} from '@mui/material';

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [isAPIrunning, setIsAPIrunning] = useState(false);

  const getOrderTracking = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/orders/tracking?user_id=${user.id}`
      );

      const ordersData = await Promise.all(
        response.data.map(async (order) => {
          const resP = await axios.get(
            `http://localhost:5000/cart/orderId?order_id=${order.orders_id}`
          );

          const productsData = await Promise.all(
            resP.data.map(async (item) => {
              const product = await axios.get(
                `http://localhost:5000/products?id=${item.products_id}`
              );
              return {
                oldPrice: item.oldPrice,
                cart_id: item.cart_id,
                quantity: item.quantity,
                ...product.data[0], // Assuming product.data is an array
              };
            })
          );

          return {
            orders_id: order.orders_id,
            status: order.status,
            orderDate: order.order_date,
            products: productsData,
          };
        })
      );

      setOrders(ordersData);
      console.log("ordersData")
      console.log(ordersData)
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order tracking data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrderTracking();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }


  const handleChange = async (orders_id,status) => {
    setIsAPIrunning(true)
    console.log(orders_id,"  ",status)
    const response = await axios.put(`http://localhost:5000/orders/status?orders_id=${orders_id}&status=${status}`);
    if(response.status === 200){
      getOrderTracking();
    }
    setIsAPIrunning(false)

  };

  return (
    <Box sx={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom align="center">
        Order Tracking
      </Typography>
      <Grid container spacing={4}>
        {orders.map((order) => (
          <Grid item xs={12} key={order.orderId}>
            <Card sx={{ boxShadow: 3, padding: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order ID: {order.orders_id}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {user?.role === "admin" ? (
                  <FormControl fullWidth>
                    <InputLabel id="status-select-label">Status</InputLabel>
                    <Select
                      disabled={isAPIrunning}
                      labelId="status-select-label"
                      id="status-select"
                      defaultValue={order.status}
                      onChange={(e)=>handleChange(order.orders_id,e.target.value)}
                      label="Status"
                      sx={{width:"200px"}}
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Processing">Processing</MenuItem>
                      <MenuItem value="Shipped">Shipped</MenuItem>
                      <MenuItem value="Delivered">Delivered</MenuItem>
                      <MenuItem value="finished">finished</MenuItem>
                    </Select>
                  </FormControl>
                  ) : (<>
                    Status: {order.status}
                  </>)}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Order Date: {new Date(order.orderDate).toLocaleDateString()}
                </Typography>
                <Divider sx={{ marginY: 2 }} />
                <Grid container spacing={2}>
                  {order.products.map((product) => (
                    <Grid item xs={12} sm={6} md={4} key={product.cart_id}>
                      <Card sx={{ boxShadow: 1 }}>
                        <CardMedia
                          component="img"
                          image={"./images/" + product.image_url} // Use product.image_url
                          alt={product.name} // Use product.name
                          height="200"
                          sx={{ objectFit: "cover" }} // Ensures the image fits properly
                        />
                        <CardContent>
                          <Typography variant="body1" gutterBottom>
                            {product.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {product.description}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Quantity:</strong> {product.quantity}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Price:</strong> ${product.oldPrice}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Total:</strong> ${product.oldPrice * product.quantity}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default OrderTracking;
