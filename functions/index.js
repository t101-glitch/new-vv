const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const axios = require("axios");
const crypto = require("crypto");

admin.initializeApp();

// Paystack Secret Key - In production, this should be in Firebase Secrets
// pk_test_9e69a61786b0d6b138e4df552bc2be6f0793bae9 was provided by user
// Secret key usually starts with sk_test_
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "sk_test_PLACEHOLDER";

exports.paystackWebhook = onRequest(async (req, res) => {
    // 1. Verify Signature
    const hash = crypto
        .createHmac("sha512", PAYSTACK_SECRET_KEY)
        .update(JSON.stringify(req.body))
        .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
        console.error("Invalid Paystack Signature");
        return res.status(401).send("Unauthorized");
    }

    const event = req.body;

    // 2. Handle Event
    if (event.event === "charge.success") {
        const { metadata, customer } = event.data;
        const userId = metadata?.userId || customer?.email;

        console.log(`Payment successful for user: ${userId}`);

        try {
            // Upgrade User Plan in Data Connect via GraphQL
            const DATA_CONNECT_ENDPOINT = `https://us-central1-varsityvault-db12c.firebaseapp.com/graphql`;

            const mutation = `
                mutation UpdateUserPlan($id: String!, $plan: String!) {
                    user_update(id: $id, data: { plan: $plan })
                }
            `;

            console.log(`Sending update request to Data Connect for user: ${userId}`);

            const response = await axios.post(DATA_CONNECT_ENDPOINT, {
                query: mutation,
                variables: {
                    id: userId,
                    plan: 'PREMIUM'
                }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    // Note: In production, add 'x-firebase-auth-token' with a service account token
                }
            });

            console.log('Update result:', JSON.stringify(response.data));

        } catch (error) {
            console.error("Error updating user plan:", error?.response?.data || error.message);
            return res.status(500).send("Internal Server Error");
        }
    }

    res.status(200).send("ok");
});
