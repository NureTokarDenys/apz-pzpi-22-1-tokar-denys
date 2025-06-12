const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ruleSchema = new Schema({
    greenhouseId: { type: Schema.Types.ObjectId, ref: 'Greenhouse', required: true },
    condition: { type: String, required: true, enum: ['sensor_based'] },
    action: {
      type: String,
      required: true,
    },
    threshold: {
        sensorModelId: { type: String, required: true },
        operator: { type: String, required: true, enum: ['>', '<', '>=', '<='] },
        value: { type: Schema.Types.Mixed, required: true }
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
});

module.exports = mongoose.model('Rule', ruleSchema);