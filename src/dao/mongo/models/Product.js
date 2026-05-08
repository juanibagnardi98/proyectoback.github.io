const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  status: { type: Boolean, default: true },
  stock: { type: Number, default: 0 },
  category: { type: String, required: true },
  thumbnails: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
