const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const logSchema = new Schema({
    greenhouseId: { type: Schema.Types.ObjectId, ref: 'Greenhouse', required: true },
    type: { type: String, enum: ['error', 'info', 'action'], default: 'info' },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null }
});

module.exports = mongoose.model('Log', logSchema);