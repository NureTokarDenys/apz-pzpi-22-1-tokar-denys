const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AllowedHardwareSchema = new Schema({
    hardwareId: {
        type: String,
        required: true,
        unique: true, 
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    isAssigned: {
        type: Boolean,
        default: false
    },
    assignedGreenhouseId: {
        type: Schema.Types.ObjectId,
        ref: 'Greenhouse',
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('AllowedHardware', AllowedHardwareSchema);