const sendPushNotification = async (deviceToken, title, body, data = {}) => {
    if (!deviceToken) {
        console.log("Push: No device token provided, skipping.");
        return;
    }
    console.log(`Push to ${deviceToken}: ${title} - ${body} - Data: ${JSON.stringify(data)}`);
    // TODO: Implement actual push notification logic
    return Promise.resolve({ success: true, messageId: `simulated_push_${Date.now()}` });
};

module.exports = { sendPushNotification };