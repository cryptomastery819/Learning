// tron_sweeper.js
const TronWeb = require("tronweb");
require("dotenv").config();

// Load environment variables (Create a .env file with your private key)
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const NODE_URL = "https://api.trongrid.io"; // Mainnet URL
const DESTINATION_ADDRESS = process.env.DESTINATION_ADDRESS; // Address to sweep funds to

// Initialize TronWeb
const tronWeb = new TronWeb({
    fullHost: NODE_URL,
    privateKey: PRIVATE_KEY
});

// Function to get balance of an address
async function getBalance(address) {
    try {
        let balance = await tronWeb.trx.getBalance(address);
        return tronWeb.fromSun(balance); // Convert from SUN to TRX
    } catch (error) {
        console.error("Error getting balance:", error);
        return 0;
    }
}

// Function to sweep funds to another address
async function sweepFunds() {
    try {
        const myAddress = tronWeb.address.fromPrivateKey(PRIVATE_KEY);
        let balance = await getBalance(myAddress);
        
        if (balance > 1) { // Keep a buffer to avoid fees issue
            let amountToSend = tronWeb.toSun(balance - 0.5); // Leave 0.5 TRX for fees
            let transaction = await tronWeb.trx.sendTransaction(DESTINATION_ADDRESS, amountToSend);
            
            console.log(`Swept ${balance - 0.5} TRX to ${DESTINATION_ADDRESS}:`, transaction);
        } else {
            console.log("Insufficient balance to sweep.");
        }
    } catch (error) {
        console.error("Error sweeping funds:", error);
    }
}

// Monitor transactions and sweep if needed
async function monitorAndSweep() {
    console.log("Tron Sweeper Bot Started...");
    while (true) {
        await sweepFunds();
        await new Promise(resolve => setTimeout(resolve, 30000)); // Check every 30 seconds
    }
}

monitorAndSweep();
