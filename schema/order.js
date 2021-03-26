/*
FileName : productModel.js
Date : 11th March 2019
Description : This file consist of Product's model fields
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  shopUrl: { type: String, required: true },
  orderId: { type: Number, unique: true, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  },
  shopifyData: { type: Object },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
});

const index = { userId: 1 };
orderSchema.index(index);

module.exports = mongoose.model('Orders', orderSchema);
