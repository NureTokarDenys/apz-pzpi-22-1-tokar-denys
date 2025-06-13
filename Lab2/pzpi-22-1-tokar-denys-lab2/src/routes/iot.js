const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const SensorData = require('../models/SensorData');
const Sensor = require('../models/Sensor');
const Rule = require('../models/Rule');
const Greenhouse = require('../models/AutoGreenhouse'); 
const Log = require('../models/Log');

router.post('/telemetry', async (req, res) => {
    const { hardwareId, readings } = req.body;

    if (!hardwareId || !readings || !Array.isArray(readings)) {
        return res.status(400).json({ message: "Device hardwareId and readings array are required" });
    }

    let greenhouse;
    try {
        greenhouse = await Greenhouse.findOne({ hardwareId: hardwareId }).populate('ownerId');
        
        if (!greenhouse) {
             await new Log({
                greenhouseId: null,
                type: 'error',
                message: `Telemetry received for unknown hardware ID: ${hardwareId}`
            }).save();
            return res.status(404).json({ message: "Greenhouse not found. Register this ID." });
        }

        for (const reading of readings) {
            if (reading.sensorModelId === undefined || reading.value === undefined) {
                continue;
            }
            const sensor = await Sensor.findOne({ model: reading.sensorModelId, greenhouseId: greenhouse._id });
            if (sensor) {
                const newSensorData = new SensorData({
                    sensorId: sensor._id,
                    value: reading.value,
                    timestamp: new Date()
                });
                await newSensorData.save();
                sensor.lastValue = reading.value;
                sensor.lastUpdated = newSensorData.timestamp;
                await sensor.save();
                await new Log({
                    greenhouseId: greenhouse._id,
                    type: 'info',
                    message: `Telemetry from ${sensor.type} (${sensor.model}): ${reading.value} ${sensor.unit}`
                }).save();
            } else {
                 await new Log({
                    greenhouseId: greenhouse._id,
                    type: 'warning',
                    message: `Sensor with model ID '${reading.sensorModelId}' not found for greenhouse '${greenhouse.name}'. Reading ignored.`
                }).save();
            }
        }

        const activeRules = await Rule.find({ greenhouseId: greenhouse._id, status: 'active', condition: 'sensor_based' });
        const commandsToSend = [];
        const currentSensorValues = {};
        const sensorsInGreenhouse = await Sensor.find({ greenhouseId: greenhouse._id });
        sensorsInGreenhouse.forEach(s => {
            currentSensorValues[s.model] = { value: s.lastValue, type: s.type };
        });

        for (const rule of activeRules) {
            let ruleTriggered = false;
            if (rule.threshold && rule.threshold.sensorModelId && rule.threshold.operator && rule.threshold.value !== undefined) {
                const sensorModelId = rule.threshold.sensorModelId;
                const operator = rule.threshold.operator;
                const thresholdValue = parseFloat(rule.threshold.value);

                if (currentSensorValues[sensorModelId] && currentSensorValues[sensorModelId].value !== undefined) {
                    const currentValue = parseFloat(currentSensorValues[sensorModelId].value);
                    if (operator === '>' && currentValue > thresholdValue) ruleTriggered = true;
                    else if (operator === '<' && currentValue < thresholdValue) ruleTriggered = true;
                    else if (operator === '>=' && currentValue >= thresholdValue) ruleTriggered = true;
                    else if (operator === '<=' && currentValue <= thresholdValue) ruleTriggered = true;
                }
            }

            if (ruleTriggered) {
                commandsToSend.push({
                    action: rule.action,
                    ruleId: rule._id.toString()
                });
                
                const logMessage = `Правило спрацювало: Якщо ${currentSensorValues[rule.threshold.sensorModelId].type} ${rule.threshold.operator} ${rule.threshold.value}, то виконати "${rule.action}". Поточне значення: ${currentSensorValues[rule.threshold.sensorModelId].value}.`;
                
                await new Log({
                    greenhouseId: greenhouse._id,
                    type: 'action',
                    message: `${logMessage} Надсилання команди.`
                }).save();

                if (greenhouse.ownerId && greenhouse.ownerId.fcmToken) {
                    const fcmMessage = {
                        notification: {
                            title: `Теплиця: "${greenhouse.name}"`,
                            body: logMessage
                        },
                        token: greenhouse.ownerId.fcmToken
                    };

                    try {
                        const response = await admin.messaging().send(fcmMessage);
                        console.log('Successfully sent FCM message:', response);
                        await new Log({
                            greenhouseId: greenhouse._id,
                            type: 'info',
                            message: `Push-сповіщення успішно надіслано користувачу ${greenhouse.ownerId.username}.`
                        }).save();
                    } catch (error) {
                        console.error('Error sending FCM message:', error);
                        await new Log({
                            greenhouseId: greenhouse._id,
                            type: 'error',
                            message: `Помилка надсилання push-сповіщення користувачу ${greenhouse.ownerId.username}: ${error.message}`
                        }).save();
                    }
                } else {
                    console.log(`User ${greenhouse.ownerId.username} does not have an FCM token.`);
                }
            }
        }
        res.status(200).json({ commands: commandsToSend });

    } catch (err) {
        console.error("Error processing IoT telemetry:", err);
         if (greenhouse && greenhouse._id) {
            await new Log({
                greenhouseId: greenhouse._id,
                type: 'error',
                message: `Server error processing telemetry: ${err.message}`
            }).save();
        } else if (hardwareId) {
             await new Log({
                greenhouseId: null,
                type: 'error',
                message: `Server error processing telemetry for unlinked hardwareId ${hardwareId}: ${err.message}`
            }).save();
        }
        res.status(500).json({ message: 'Server error processing telemetry', details: err.message });
    }
});

module.exports = router;