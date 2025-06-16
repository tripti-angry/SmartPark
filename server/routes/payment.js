const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Create payment intent
router.post('/create-intent', auth, async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user.userId
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Booking already paid' });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalAmount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        bookingId: booking._id.toString(),
        userId: req.user.userId
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: booking.totalAmount
    });
  } catch (error) {
    logger.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Confirm payment
router.post('/confirm', auth, async (req, res) => {
  try {
    const { paymentIntentId, bookingId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update booking payment status
      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        { 
          paymentStatus: 'paid',
          paidAt: new Date()
        },
        { new: true }
      );

      // Create payment record
      const payment = new Payment({
        user: req.user.userId,
        booking: bookingId,
        amount: booking.totalAmount,
        paymentMethod: 'stripe',
        stripePaymentIntentId: paymentIntentId,
        status: 'completed'
      });

      await payment.save();

      logger.info(`Payment confirmed: ${paymentIntentId} for booking ${bookingId}`);

      res.json({
        message: 'Payment confirmed successfully',
        booking,
        payment
      });
    } else {
      res.status(400).json({ message: 'Payment not successful' });
    }
  } catch (error) {
    logger.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment history
router.get('/history', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.userId })
      .populate(['booking'])
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    logger.error('Get payment history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;