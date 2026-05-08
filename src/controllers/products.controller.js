const { getPersistenceLayer } = require('../dao/daoFactory');

function buildPaginationLinks(req, page, prevPage, nextPage) {
  const baseUrl = req.baseUrl + req.path;
  const query = { ...req.query };

  const buildLink = (targetPage) => {
    if (!targetPage) return null;
    return `${baseUrl}?${new URLSearchParams({
      ...query,
      page: targetPage
    }).toString()}`;
  };

  return {
    prevLink: buildLink(prevPage),
    nextLink: buildLink(nextPage)
  };
}

async function getProducts(req, res) {
  try {
    const { productDao } = getPersistenceLayer();
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;
    const sort = req.query.sort === 'desc' ? 'desc' : req.query.sort === 'asc' ? 'asc' : null;
    const filters = {};
    const queryFilter = req.query.query;
    if (queryFilter !== undefined) {
      if (queryFilter === 'true' || queryFilter === 'false') {
        filters.status = queryFilter === 'true';
      } else {
        filters.category = queryFilter;
      }
    }
    if (req.query.category) filters.category = req.query.category;
    if (req.query.status !== undefined) filters.status = req.query.status === 'true';

    const result = await productDao.getAll({ limit, page, filters, sort });

    const links = buildPaginationLinks(req, result.page, result.prevPage, result.nextPage);

    res.json({
      status: 'success',
      payload: result.payload,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: links.prevLink,
      nextLink: links.nextLink
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
}

async function getProductById(req, res) {
  try {
    const { productDao } = getPersistenceLayer();
    const product = await productDao.getById(req.params.pid);
    if (!product) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    res.json({ status: 'success', payload: product });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
}

async function createProduct(req, res) {
  try {
    const { productDao } = getPersistenceLayer();
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;
    if (!title || !description || !code || price === undefined || stock === undefined || !category) {
      return res.status(400).json({ status: 'error', error: 'Faltan campos obligatorios' });
    }

    const product = await productDao.create({ title, description, code, price, status, stock, category, thumbnails });
    req.app.get('io')?.emit('productListUpdated');
    res.status(201).json({ status: 'success', payload: product });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
}

async function updateProduct(req, res) {
  try {
    const { productDao } = getPersistenceLayer();
    const updates = { ...req.body };
    delete updates._id;
    delete updates.id;
    const updated = await productDao.update(req.params.pid, updates);
    if (!updated) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    req.app.get('io')?.emit('productListUpdated');
    res.json({ status: 'success', payload: updated });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
}

async function deleteProduct(req, res) {
  try {
    const { productDao } = getPersistenceLayer();
    const deleted = await productDao.delete(req.params.pid);
    if (!deleted) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    req.app.get('io')?.emit('productListUpdated');
    res.json({ status: 'success', payload: { message: 'Producto eliminado' } });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
}

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
