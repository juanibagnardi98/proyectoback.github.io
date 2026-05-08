const { getPersistenceLayer, getPersistenceType } = require('../dao/daoFactory');

async function populateCart(cart) {
  if (!cart) return null;
  const persistence = getPersistenceType();
  if (persistence === 'fs') {
    const { productDao } = getPersistenceLayer();
    const populated = { ...cart, products: [] };
    for (const item of cart.products) {
      const product = await productDao.getById(item.productId);
      populated.products.push({ product: product || { _id: item.productId }, quantity: item.quantity });
    }
    return populated;
  }
  return cart;
}

async function createCart(req, res) {
  try {
    const { cartDao } = getPersistenceLayer();
    const cart = await cartDao.createCart();
    res.status(201).json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
}

async function getCartById(req, res) {
  try {
    const { cartDao } = getPersistenceLayer();
    const cart = await cartDao.getById(req.params.cid);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
    const populatedCart = await populateCart(cart);
    res.json({ status: 'success', payload: populatedCart });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
}

async function addProductToCart(req, res) {
  try {
    const { cartDao } = getPersistenceLayer();
    const { cid, pid } = req.params;
    const cart = await cartDao.addProduct(cid, pid, parseInt(req.body.quantity, 10) || 1);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito o producto no encontrado' });
    res.status(201).json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
}

async function removeProductFromCart(req, res) {
  try {
    const { cartDao } = getPersistenceLayer();
    const cart = await cartDao.removeProduct(req.params.cid, req.params.pid);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito o producto no encontrado' });
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
}

async function updateCartProducts(req, res) {
  try {
    const { cartDao } = getPersistenceLayer();
    const products = Array.isArray(req.body.products) ? req.body.products : [];
    const cart = await cartDao.updateCartProducts(req.params.cid, products);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
}

async function updateProductQuantity(req, res) {
  try {
    const { cartDao } = getPersistenceLayer();
    const quantity = parseInt(req.body.quantity, 10);
    if (Number.isNaN(quantity)) {
      return res.status(400).json({ status: 'error', error: 'Cantidad inválida' });
    }
    const cart = await cartDao.updateProductQuantity(req.params.cid, req.params.pid, quantity);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito o producto no encontrado' });
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
}

async function emptyCart(req, res) {
  try {
    const { cartDao } = getPersistenceLayer();
    const cart = await cartDao.emptyCart(req.params.cid);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
}

module.exports = {
  createCart,
  getCartById,
  addProductToCart,
  removeProductFromCart,
  updateCartProducts,
  updateProductQuantity,
  emptyCart
};
