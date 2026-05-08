const { Router } = require('express');
const { renderProductsPage, renderProductDetail, renderCartPage } = require('../controllers/views.controller');

const router = Router();

router.get('/products', renderProductsPage);
router.get('/products/:pid', renderProductDetail);
router.get('/carts/:cid', renderCartPage);

module.exports = router;
