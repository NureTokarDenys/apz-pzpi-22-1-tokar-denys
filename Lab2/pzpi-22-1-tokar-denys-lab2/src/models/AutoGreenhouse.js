const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Sensor = require('./Sensor');
const Rule = require('./Rule');
const Log = require('./Log');
const SensorData = require('./SensorData');

const greenhouseSchema = new Schema({
    name: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hardwareId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    createdAt: { type: Date, default: Date.now },
});

greenhouseSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
    try {
        const greenhouseId = this._id;
        const sensors = await Sensor.find({ greenhouseId: greenhouseId });
        for (const sensor of sensors) {
            await SensorData.deleteMany({ sensorId: sensor._id });
        }
        await Sensor.deleteMany({ greenhouseId: greenhouseId });
        await Rule.deleteMany({ greenhouseId: greenhouseId });
        await Log.deleteMany({ greenhouseId: greenhouseId });
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Greenhouse', greenhouseSchema);