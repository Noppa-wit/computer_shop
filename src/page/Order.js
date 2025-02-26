import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  CircularProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from "@mui/material";

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(sessionStorage.getItem("user"));

  const getOrderTracking = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/orders/history?user_id=${user.id}`
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

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom align="center">
        Order History
      </Typography>
      <Divider sx={{ mb: 3 }} />
      {orders.map((order) => (
        <Box key={order.orders_id} sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Order ID: {order.orders_id}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Status: {order.status}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Order Date: {new Date(order.orderDate).toLocaleDateString()}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.products.map((product) => (
                  <TableRow key={product.cart_id}>
                    <TableCell>
                      <img
                        src={`./images/${product.image_url}`}
                        alt={product.name}
                        style={{ width: "80px", borderRadius: "8px" }}
                      />
                      <Typography variant="body2">{product.name}</Typography>
                    </TableCell>
                    <TableCell>{product.description}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>฿ {product.oldPrice}</TableCell>
                    <TableCell>฿ {product.oldPrice * product.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </Box>
  );
};

export default OrderTracking;
