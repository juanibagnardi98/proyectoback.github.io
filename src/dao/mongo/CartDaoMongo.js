const Cart = require('./models/Cart');

class CartDaoMongo {
  async createCart() {
    const cart = await Cart.create({ products: [] });
    return cart.toObject();
  }

  async getById(id) {
    return Cart.findById(id).populate('products.product').lean();
  }

  async addProduct(cartId, productId, quantity = 1) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;
    const item = cart.products.find(p => p.product.toString() === productId);
    if (item) {
      item.quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }
    cart.updatedAt = new Date();
    await cart.save();
    return cart.populate('products.product').then(doc => doc.toObject());
  }

  async removeProduct(cartId, productId) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;
    cart.products = cart.products.filter(p => p.product.toString() !== productId);
    cart.updatedAt = new Date();
    await cart.save();
    return cart.populate('products.product').then(doc => doc.toObject());
  }

  async updateCartProducts(cartId, products = []) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;
    cart.products = products.map(item => ({ product: item.productId, quantity: item.quantity || 1 }));
    cart.updatedAt = new Date();
    await cart.save();
    return cart.populate('products.product').then(doc => doc.toObject());
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;
    const item = cart.products.find(p => p.product.toString() === productId);
    if (!item) return null;
    item.quantity = quantity;
    cart.updatedAt = new Date();
    await cart.save();
    return cart.populate('products.product').then(doc => doc.toObject());
  }

  async emptyCart(cartId) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;
    cart.products = [];
    cart.updatedAt = new Date();
    await cart.save();
    return cart.toObject();
  }
}

module.exports = CartDaoMongo;
