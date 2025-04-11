const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true }
  }, { collection: 'Product' }); // نام کالکشن را مشخص کنید
  
  module.exports = mongoose.model('Product', productSchema);