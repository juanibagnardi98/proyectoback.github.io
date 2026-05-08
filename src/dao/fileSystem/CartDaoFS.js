const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class CartDaoFS {
  constructor(filePath) {
    this.filePath = filePath || path.resolve(__dirname, '../../../data/carts.json');
    this._initialize();
  }

  async _initialize() {
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      await fs.writeFile(this.filePath, JSON.stringify([]));
    }
  }

  async _readFile() {
    const content = await fs.readFile(this.filePath, 'utf-8');
    return JSON.parse(content || '[]');
  }

  async _writeFile(data) {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  async createCart() {
    const carts = await this._readFile();
    const cart = {
      _id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2),
      products: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    carts.push(cart);
    await this._writeFile(carts);
    return cart;
  }

  async getById(id) {
    const carts = await this._readFile();
    return carts.find(c => c._id === id) || null;
  }

  async save(carts) {
    await this._writeFile(carts);
  }

  async addProduct(cartId, productId, quantity = 1) {
    const carts = await this._readFile();
    const cart = carts.find(c => c._id === cartId);
    if (!cart) return null;
    const item = cart.products.find(p => p.productId === productId);
    if (item) {
      item.quantity += quantity;
    } else {
      cart.products.push({ productId, quantity });
    }
    cart.updatedAt = new Date();
    await this._writeFile(carts);
    return cart;
  }

  async removeProduct(cartId, productId) {
    const carts = await this._readFile();
    const cart = carts.find(c => c._id === cartId);
    if (!cart) return null;
    cart.products = cart.products.filter(item => item.productId !== productId);
    cart.updatedAt = new Date();
    await this._writeFile(carts);
    return cart;
  }

  async updateCartProducts(cartId, products = []) {
    const carts = await this._readFile();
    const cart = carts.find(c => c._id === cartId);
    if (!cart) return null;
    cart.products = products.map(item => ({ productId: item.productId, quantity: item.quantity || 1 }));
    cart.updatedAt = new Date();
    await this._writeFile(carts);
    return cart;
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const carts = await this._readFile();
    const cart = carts.find(c => c._id === cartId);
    if (!cart) return null;
    const item = cart.products.find(p => p.productId === productId);
    if (!item) return null;
    item.quantity = quantity;
    cart.updatedAt = new Date();
    await this._writeFile(carts);
    return cart;
  }

  async emptyCart(cartId) {
    const carts = await this._readFile();
    const cart = carts.find(c => c._id === cartId);
    if (!cart) return null;
    cart.products = [];
    cart.updatedAt = new Date();
    await this._writeFile(carts);
    return cart;
  }
}

module.exports = CartDaoFS;
