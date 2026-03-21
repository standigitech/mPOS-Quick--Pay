const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// 🔑 Your Credentials (Use .env file for safety!)
const consumerKey = "YOUR_CONSUMER_KEY";
const consumerSecret = "YOUR_CONSUMER_SECRET";
const shortCode = "174379"; // Sandbox Shortcode
const passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";

// 🕒 Function to get M-Pesa Timestamp (YYYYMMDDHHMMSS)
const getTimestamp = () => {
    return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
};

// 🛡️ Middleware to get Access Token
const getAccessToken = async (req, res, next) => {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    try {
        const response = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
            headers: { Authorization: `Basic ${auth}` }
        });
        req.accessToken = response.data.access_token;
        next();
    } catch (error) {
        res.status(500).send("Failed to get token");
    }
};

// 📲 The STK Push Route
app.post('/stkpush', getAccessToken, async (req, res) => {
    const { phone, amount } = req.body;
    const timestamp = getTimestamp();
    const password = Buffer.from(shortCode + passkey + timestamp).toString('base64');

    const data = {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone, // Customer phone
        PartyB: shortCode,
        PhoneNumber: phone,
        CallBackURL: "https://yourdomain.com/callback", // Needs to be a public URL
        AccountReference: "KinyoziPay",
        TransactionDesc: "Payment for haircut"
    };

    try {
        const response = await axios.post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", data, {
            headers: { Authorization: `Bearer ${req.accessToken}` }
        });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json(error.response.data);
    }
});

app.listen(3000, () => console.log("🚀 Server running on port 3000"));