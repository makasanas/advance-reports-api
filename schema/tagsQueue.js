
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tagsQueueSchema = new Schema({
    shopUrl: { type: String, required: true },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
    },
    rules: { type: Object, required: true },
    req: { type: Object, required: true },
    orderId: { type: String, required: true },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('tags_queue', tagsQueueSchema);