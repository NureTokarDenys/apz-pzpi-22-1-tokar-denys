const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const corsOptions = require('./src/options/corsOptions');
const { connectDB } = require('./src/config/db');
const routes = require('./src/routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const admin = require('firebase-admin');
const serviceAccount = require('./greenhouse-push-notification-firebase-adminsdk-fbsvc-9e8f3f9817.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.stack);
    res.status(500).send('Something broke on the server!');
});

connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  }).catch((err) => {
    console.error("Failed to connect to DB, server not started:", err);
    process.exit(1);
});