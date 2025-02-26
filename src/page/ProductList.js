import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Container,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import axios from "axios";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", description: "", price: 0, stock: 0, image_url: "" });
  const [editForm, setEditForm] = useState({ name: "", description: "", price: 0, stock: 0, image_url: "" });
  const user = JSON.parse(sessionStorage.getItem("user"));

  const getData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleDeleteProduct = async (productID) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(`http://localhost:5000/products/${productID}`);
      alert("Product deleted successfully!");
      getData();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Please try again.");
    }
  };

  const handleAddToCartClick = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setOpen(true);
  };

  const handleAddToCart = async () => {
    if (!selectedProduct) return;

    try {
      const response = await axios.post("http://localhost:5000/cart", {
        products_id: selectedProduct.products_id,
        users_id: user.id,
        quantity,
      });
      alert(response.data.message || "Product added to cart successfully!");
      setOpen(false);
    } catch (error) {
      console.error("Error adding product to cart:", error);
      alert("Failed to add product to cart. Please try again.");
    }
  };

  const handleEditClick = (product) => {
    setEditForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      image_url: product.image_url,
    });
    setSelectedProduct(product);
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    try {
      await axios.put(`http://localhost:5000/products/${selectedProduct.products_id}`, editForm);
      alert("Product updated successfully!");
      setEditOpen(false);
      getData();
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product. Please try again.");
    }
  };

  const handleAddProduct = async () => {
    try {
      await axios.post("http://localhost:5000/products", addForm);
      alert("Product added successfully!");
      setAddOpen(false);
      getData();
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Please try again.");
    }
  };

  const handleAddClick = () => {
    setAddForm({ name: "", description: "", price: 0, stock: 0, image_url: "" });
    setAddOpen(true);
  };

  const handleAddClose = () => {
    setAddOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProduct(null);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setSelectedProduct(null);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        Product List
      </Typography>
      {user?.role === "admin" ? (
        <Box sx={{ textAlign: "right", mb: 3 }}>
          <Button variant="contained" color="success" onClick={handleAddClick}>
            Add Product
          </Button>
        </Box>
      ) : (<>
                    
                  </>)}
      <Grid container spacing={4}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.products_id}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <CardMedia
                component="img"
                image={"./images/" + product.image_url}
                alt={product.name}
                height="200"
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Stock: {product.stock}
                </Typography>
                <Typography variant="body1" color="text.primary" sx={{ mt: 1 }}>
                  ฿ {product.price}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => handleAddToCartClick(product)}
                >
                  Add to Cart
                </Button>
                {user?.role === "admin" ? (
  <>
    <Button
      variant="outlined"
      color="secondary"
      fullWidth
      sx={{ mt: 1 }}
      onClick={() => handleEditClick(product)}
    >
      Edit Product
    </Button>
    <Button
      variant="contained"
      color="error"
      fullWidth
      sx={{ mt: 1 }}
      onClick={() => handleDeleteProduct(product.products_id)}
    >
      Delete Product
    </Button>
  </>
) : null}

                
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add to Cart Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add to Cart</DialogTitle>
        {selectedProduct && (
          <DialogContent>
            <Typography variant="h6">{selectedProduct.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedProduct.description}
            </Typography>
            <Typography variant="body1" color="text.primary" sx={{ mt: 1 }}>
              ${selectedProduct.price}
            </Typography>
            <TextField
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              fullWidth
              sx={{ mt: 2 }}
            />
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddToCart} variant="contained" color="primary">
            Add to Cart
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            label="Description"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Price"
            type="number"
            value={editForm.price}
            onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            label="Stock"
            type="number"
            value={editForm.stock}
            onChange={(e) => setEditForm({ ...editForm, stock: parseInt(e.target.value, 10) || 0 })}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            label="Image URL"
            value={editForm.image_url}
            onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleEditSave} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={addOpen} onClose={handleAddClose}>
        <DialogTitle>Add Product</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={addForm.name}
            onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            label="Description"
            value={addForm.description}
            onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Price"
            type="number"
            value={addForm.price}
            onChange={(e) => setAddForm({ ...addForm, price: parseFloat(e.target.value) })}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            label="Stock"
            type="number"
            value={addForm.stock}
            onChange={(e) => setAddForm({ ...addForm, stock: parseInt(e.target.value, 10) || 0 })}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            label="Image URL"
            value={addForm.image_url}
            onChange={(e) => setAddForm({ ...addForm, image_url: e.target.value })}
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddProduct} variant="contained" color="primary">
            Add Product
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductList;
