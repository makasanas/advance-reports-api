const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const syncDetailSchema = new Schema({
  shopUrl: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  },
  orderSync: { type: Object },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
});

const index = { shopUrl: 1 };
syncDetailSchema.index(index);

module.exports = mongoose.model('syncDetail', syncDetailSchema);
