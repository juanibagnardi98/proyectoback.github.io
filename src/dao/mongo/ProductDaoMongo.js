const Product = require('./models/Product');

class ProductDaoMongo {
  async getAll({ limit = 10, page = 1, filters = {}, sort = null } = {}) {
    const query = {};
    if (filters.category) query.category = filters.category;
    if (filters.status !== undefined) query.status = filters.status;

    const options = {};
    if (sort === 'asc') options.sort = { price: 1 };
    if (sort === 'desc') options.sort = { price: -1 };

    const totalDocs = await Product.countDocuments(query);
    const totalPages = totalDocs === 0 ? 0 : Math.ceil(totalDocs / limit);
    const currentPage = totalPages === 0 ? 1 : Math.min(Math.max(1, page), totalPages);
    const docs = await Product.find(query)
      .sort(options.sort)
      .skip((currentPage - 1) * limit)
      .limit(limit)
      .lean();

    return {
      payload: docs,
      totalPages,
      prevPage: currentPage > 1 ? currentPage - 1 : null,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
      page: currentPage,
      hasPrevPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      totalDocs
    };
  }

  async getById(id) {
    return Product.findById(id).lean();
  }

  async create(product) {
    const created = await Product.create(product);
    return created.toObject();
  }

  async update(id, updates) {
    return Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean();
  }

  async delete(id) {
    const result = await Product.findByIdAndDelete(id);
    return Boolean(result);
  }
}

module.exports = ProductDaoMongo;
