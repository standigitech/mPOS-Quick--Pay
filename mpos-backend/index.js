const express = require('express');
const cors = require('cors');
const axios = require('axios'); // We added this to make outside web requests
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 1. MIDDLEWARE TO GET DARAJA ACCESS TOKEN ---
const getAccessToken = async (req, res, next) => {
    const consumer_key = process.env.DARAJA_CONSUMER_KEY;
    const consumer_secret = process.env.DARAJA_CONSUMER_SECRET;
    
    // Safaricom sandbox URL for getting tokens
    const url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

    // Safaricom requires the keys to be combined and encoded in Base64
    const auth = Buffer.from(`${consumer_key}:${consumer_secret}`).toString('base64');

    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Basic ${auth}`
            }
        });
        
        // Save the token to the request so the next function can use it
        req.token = response.data.access_token;
        next(); 
        
    } catch (error) {
        console.error("Error getting token:", error.message);
        res.status(400).json({ error: "Failed to get M-Pesa access token" });
    }
};

// --- 2. TEST ROUTE TO CHECK OUR TOKEN ---
app.get('/test-token', getAccessToken, (req, res) => {
    // If successful, it will print the token to your browser!
    res.json({ 
        message: "Success! Safaricom gave us a token.", 
        token: req.token 
    });
});

// A simple test route to make sure the server is alive
app.get('/', (req, res) => {
    res.send('M-Pesa Backend Server is running successfully!');
});
// --- 3. TRIGGER THE M-PESA PIN POP-UP (STK PUSH) ---
app.post('/pay', getAccessToken, async (req, res) => {
    // 1. Get the phone number and amount from your mobile app
    const phone = req.body.phone;
    const amount = req.body.amount;

    // 2. Generate the Timestamp (Format: YYYYMMDDHHmmss)
    const date = new Date();
    const timestamp = date.getFullYear() +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        ("0" + date.getDate()).slice(-2) +
        ("0" + date.getHours()).slice(-2) +
        ("0" + date.getMinutes()).slice(-2) +
        ("0" + date.getSeconds()).slice(-2);

    // 3. Generate the Password (Base64 of Shortcode + Passkey + Timestamp)
    const shortcode = process.env.DARAJA_SHORTCODE;
    const passkey = process.env.DARAJA_PASSKEY;
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    // 4. The Safaricom URL for STK Push
    const url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

    try {
        // 5. Send the request to Safaricom
        const response = await axios.post(url, {
            "BusinessShortCode": shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline", 
            "Amount": amount,
            "PartyA": phone, // The customer's phone number
            "PartyB": shortcode, // Your Paybill/Till number
            "PhoneNumber": phone, // The customer's phone number again
            "CallBackURL": "https://mydomain.com/callback", // We will fix this later!
            "AccountReference": "mPOS Quick Pay",
            "TransactionDesc": "Payment for services"
        }, {
            headers: {
                Authorization: `Bearer ${req.token}` // Using the token we got earlier
            }
        });

        // 6. Send the success response back to your mobile app
        res.status(200).json(response.data);
        
    } catch (error) {
        console.error("STK Push Error:", error.response ? error.response.data : error.message);
        res.status(400).json({ error: "Failed to trigger M-Pesa prompt" });
    }
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});