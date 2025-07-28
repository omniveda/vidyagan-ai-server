// Import the required modules
const express = require("express")
const router = express.Router()

const { capturePayment, verifyPayment, sendPaymentSuccessEmail, getUserReceipts, getReceiptById, getAllPayments } = require("../controllers/Payments")
const { auth, isStudent } = require("../middlewares/auth")
router.post("/capturePayment", auth, isStudent, capturePayment)
router.post("/verifyPayment",auth, isStudent, verifyPayment)
router.post("/sendPaymentSuccessEmail", auth, isStudent, sendPaymentSuccessEmail);
router.get("/receipts", auth, getUserReceipts)
router.get("/receipt/:paymentId", auth, getReceiptById)
router.get("/all-payments", auth, getAllPayments) // Debug route

module.exports = router