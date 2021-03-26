
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tagsSchema = new Schema({
    shopUrl: { type: String, required: true },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
    },
    orderId: { type: String, required: true, unique: true },
    tags: { type: Array, required: true },
    created: { type: Date, default: Date.now() },
    updated: { type: Date, default: Date.now() }
});

module.exports = mongoose.model('tags', tagsSchema);