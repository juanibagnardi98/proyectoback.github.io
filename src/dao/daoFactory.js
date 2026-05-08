const ProductDaoFS = require('./fileSystem/ProductDaoFS');
const CartDaoFS = require('./fileSystem/CartDaoFS');
const ProductDaoMongo = require('./mongo/ProductDaoMongo');
const CartDaoMongo = require('./mongo/CartDaoMongo');

let currentPersistence;
let productDaoInstance;
let cartDaoInstance;

function getPersistenceType() {
  return process.env.PERSISTENCE || 'mongo';
}

function ensurePersistenceLayer() {
  const persistence = getPersistenceType();
  if (persistence === currentPersistence && productDaoInstance && cartDaoInstance) {
    return;
  }

  currentPersistence = persistence;
  if (persistence === 'fs') {
    productDaoInstance = new ProductDaoFS();
    cartDaoInstance = new CartDaoFS();
  } else {
    productDaoInstance = new ProductDaoMongo();
    cartDaoInstance = new CartDaoMongo();
  }
}

function getPersistenceLayer() {
  ensurePersistenceLayer();
  return { productDao: productDaoInstance, cartDao: cartDaoInstance };
}

module.exports = { getPersistenceLayer, getPersistenceType };
