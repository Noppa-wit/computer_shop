import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductList from './page/ProductList';
import Cart from './page/Cart';
import Order from './page/Order';
import Payment from './page/Payment';
import OrderTracking from './page/OrderTracking';
import Login from './page/Login';
import NavBar from './components/Nav';

function App() {
  return (
    <Router>
        <NavBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProductList />} />
        <Route path="/cart" element={<Cart />} />
       <Route path="/order" element={<Order />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/order-tracking" element={<OrderTracking />} /> 
      </Routes>
    </Router>
  );
}

export default App;
