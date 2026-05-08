const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class ProductDaoFS {
  constructor(filePath) {
    this.filePath = filePath || path.resolve(__dirname, '../../../data/products.json');
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

  async getAll({ limit = 10, page = 1, filters = {}, sort = null } = {}) {
    const products = await this._readFile();
    let filtered = products;

    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    if (filters.status !== undefined) {
      filtered = filtered.filter(p => String(p.status) === String(filters.status));
    }

    if (sort === 'asc') filtered = filtered.sort((a, b) => a.price - b.price);
    if (sort === 'desc') filtered = filtered.sort((a, b) => b.price - a.price);

    const total = filtered.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    const currentPage = totalPages === 0 ? 1 : Math.min(Math.max(1, page), totalPages);
    const start = (currentPage - 1) * limit;
    const payload = filtered.slice(start, start + limit);

    return {
      payload,
      totalPages,
      prevPage: currentPage > 1 ? currentPage - 1 : null,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
      page: currentPage,
      hasPrevPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      totalDocs: total
    };
  }

  async getById(id) {
    const products = await this._readFile();
    return products.find(p => p._id === id) || null;
  }

  async create(product) {
    const products = await this._readFile();
    const nextId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
    const newProduct = { ...product, _id: nextId, thumbnails: product.thumbnails || [], status: product.status ?? true, createdAt: new Date() };
    products.push(newProduct);
    await this._writeFile(products);
    return newProduct;
  }

  async update(id, updates) {
    const products = await this._readFile();
    const index = products.findIndex(p => p._id === id);
    if (index === -1) return null;
    products[index] = { ...products[index], ...updates, _id: products[index]._id };
    await this._writeFile(products);
    return products[index];
  }

  async delete(id) {
    const products = await this._readFile();
    const index = products.findIndex(p => p._id === id);
    if (index === -1) return false;
    products.splice(index, 1);
    await this._writeFile(products);
    return true;
  }
}

module.exports = ProductDaoFS;
