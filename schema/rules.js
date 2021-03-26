
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rulesSchema = new Schema({
    shopUrl: { type: String, required: true },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
    },
    selector: { type: String, required: true },
    compDataType: { type: String, required: true },
    compType: { type: String, required: false },
    compValue: { type: Object, required: false },
    item: { type: Object, required: false },
    dynamicSelector: { type: String, required: false },
    dynamicItem: { type: Object, required: false },
    tagType: { type: String, required: false },
    tagValue: { type: String, required: false },
    tagPrefix: { type: String, required: false },
    tagSuffix: { type: String, required: false },
    created: { type: Date, default: Date.now() },
    updated: { type: Date, default: Date.now() }
});

module.exports = mongoose.model('rules', rulesSchema);