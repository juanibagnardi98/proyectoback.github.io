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

async function renderProductsPage(req, res) {
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
    res.render('products', { products: result.payload, pagination: result, query: req.query });
  } catch (error) {
    res.status(500).send('Error cargando productos');
  }
}

async function renderProductDetail(req, res) {
  try {
    const { productDao } = getPersistenceLayer();
    const product = await productDao.getById(req.params.pid);
    if (!product) return res.status(404).send('Producto no encontrado');
    res.render('productDetail', { product });
  } catch (error) {
    res.status(500).send('Error cargando producto');
  }
}

async function renderCartPage(req, res) {
  try {
    const { cartDao } = getPersistenceLayer();
    if (req.params.cid === 'guest') {
      const newCart = await cartDao.createCart();
      return res.redirect(`/carts/${newCart._id}`);
    }

    const cart = await cartDao.getById(req.params.cid);
    if (!cart) return res.status(404).send('Carrito no encontrado');

    const populatedCart = await populateCart(cart);
    res.render('cartDetail', { cart: populatedCart });
  } catch (error) {
    res.status(500).send('Error cargando carrito');
  }
}

module.exports = { renderProductsPage, renderProductDetail, renderCartPage };
