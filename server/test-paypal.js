// test-paypal.js - Test script for PayPal configuration
import { createPayPalOrder, capturePayPalPayment, getPayPalOrder } from './utils/paypal.js';
import dotenv from 'dotenv';

dotenv.config();

const testPayPalConnection = async () => {
  try {
    console.log('Testing PayPal configuration...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('PayPal Client ID:', process.env.PAYPAL_CLIENT_ID ? '✅ Set' : '❌ Not set');
    console.log('PayPal Client Secret:', process.env.PAYPAL_CLIENT_SECRET ? '✅ Set' : '❌ Not set');
    console.log('Client URL:', process.env.CLIENT_URL || 'http://localhost:5173');
    
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      console.log('\n❌ PayPal credentials not configured!');
      console.log('Please add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to your .env file');
      return;
    }

    // Mock course data for testing
    const mockCourse = {
      _id: 'test-course-id',
      courseTitle: 'Test Course',
      coursePrice: 29.99,
      courseThumbnail: 'https://example.com/thumbnail.jpg'
    };

    console.log('\nTesting PayPal order creation...');
    const order = await createPayPalOrder(mockCourse);
    
    console.log('✅ PayPal order created successfully!');
    console.log('Order ID:', order.id);
    console.log('Order Status:', order.status);
    console.log('Order Intent:', order.intent);
    
    // Get the approve link
    const approveLink = order.links.find(link => link.rel === 'approve');
    if (approveLink) {
      console.log('Approve URL:', approveLink.href);
    }

    console.log('\n✅ PayPal configuration is working correctly!');
    console.log('\nNext steps:');
    console.log('1. Test the payment flow with PayPal sandbox accounts');
    console.log('2. Verify webhook handling');
    console.log('3. Test payment capture functionality');
    
  } catch (error) {
    console.error('❌ PayPal configuration test failed:', error.message);
    console.log('\nPlease check:');
    console.log('1. PayPal credentials are set correctly');
    console.log('2. You have a valid PayPal Developer account');
    console.log('3. Your app is properly configured in PayPal Developer Dashboard');
    console.log('4. You\'re using the correct environment (sandbox/live)');
  }
};

testPayPalConnection(); 