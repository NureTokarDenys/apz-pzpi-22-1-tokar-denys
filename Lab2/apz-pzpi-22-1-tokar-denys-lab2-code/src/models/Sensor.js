const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sensorSchema = new Schema({
    type: {
        type: String,
        required: true,
        enum: ['temperature', 'humidity', 'light', 'soil_moisture']
    },
    greenhouseId: { type: Schema.Types.ObjectId, ref: 'Greenhouse', required: true },
    model: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    unit: { type: String, required: true },
    lastValue: { type: Schema.Types.Mixed },
    lastUpdated: { type: Date },
    isDefault: { type: Boolean, default: false }
});

module.exports = mongoose.model('Sensor', sensorSchema);