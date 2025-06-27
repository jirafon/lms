# PayPal Integration Setup Guide

This guide will help you configure PayPal as a payment method for your LMS alongside the existing Stripe integration.

## Prerequisites

1. PayPal Business Account
2. Node.js and npm installed
3. Existing LMS setup with Stripe

## Step 1: Create PayPal Developer Account

1. Go to [PayPal Developer Portal](https://developer.paypal.com/)
2. Sign up for a PayPal Developer account
3. Navigate to the Dashboard

## Step 2: Create PayPal App

1. In the Developer Dashboard, go to "My Apps & Credentials"
2. Click "Create App"
3. Choose "Business" app type
4. Give your app a name (e.g., "LMS Payment App")
5. Click "Create App"

## Step 3: Get API Credentials

After creating the app, you'll get:
- **Client ID** (for sandbox and live)
- **Secret** (for sandbox and live)

Note these credentials - you'll need them for environment variables.

## Step 4: Configure Environment Variables

Add these variables to your `.env` file:

```env
# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Client URL (for return URLs)
CLIENT_URL=http://localhost:5173

# Environment
NODE_ENV=development
```

For production, set:
```env
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
```

## Step 5: Test PayPal Integration

### Sandbox Testing

1. Use PayPal Sandbox accounts for testing:
   - **Buyer Account**: sb-buyer@business.example.com
   - **Seller Account**: sb-seller@business.example.com

2. Test the payment flow:
   - Create a course purchase with PayPal
   - Complete payment using sandbox buyer account
   - Verify course access is granted

### Production Setup

1. Switch to Live environment in PayPal Developer Dashboard
2. Update environment variables with live credentials
3. Set `NODE_ENV=production`
4. Test with real PayPal accounts

## Step 6: Configure Webhooks (Optional but Recommended)

### PayPal Webhook Setup

1. In PayPal Developer Dashboard, go to "Webhooks"
2. Click "Add Webhook"
3. Set the webhook URL: `https://yourdomain.com/api/purchase/webhook/paypal`
4. Select events:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `PAYMENT.CAPTURE.REFUNDED`

### Stripe Webhook Update

Update your existing Stripe webhook URL to:
`https://yourdomain.com/api/purchase/webhook/stripe`

## API Endpoints

### Get Payment Methods
```
GET /api/purchase/payment-methods
```
Returns available payment methods (Stripe and PayPal).

### Create Checkout Session
```
POST /api/purchase/checkout/create-checkout-session
Body: { courseId: "course_id", paymentMethod: "paypal" }
```
Creates a PayPal order or Stripe session.

### Capture PayPal Payment
```
POST /api/purchase/paypal/capture
Body: { orderId: "paypal_order_id" }
```
Captures a completed PayPal payment.

### Webhooks
```
POST /api/purchase/webhook/stripe
POST /api/purchase/webhook/paypal
```
Handle payment completion events.

## Frontend Integration

### Payment Method Selection

Add a payment method selector to your checkout page:

```javascript
const [paymentMethod, setPaymentMethod] = useState('stripe');

const handlePayment = async () => {
  const response = await fetch('/api/purchase/checkout/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      courseId: courseId,
      paymentMethod: paymentMethod
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    window.location.href = data.url; // Redirect to PayPal or Stripe
  }
};
```

### PayPal Button Integration

For a more integrated experience, you can use PayPal Buttons:

```javascript
import { PayPalButtons } from "@paypal/react-paypal-js";

<PayPalButtons
  createOrder={(data, actions) => {
    return actions.order.create({
      purchase_units: [{
        amount: {
          value: coursePrice
        }
      }]
    });
  }}
  onApprove={(data, actions) => {
    return actions.order.capture().then((details) => {
      // Handle successful payment
      handlePaymentSuccess(details);
    });
  }}
/>
```

## Security Considerations

### Environment Variables
- Never commit API credentials to version control
- Use different credentials for development and production
- Rotate credentials regularly

### Webhook Security
- Validate webhook signatures in production
- Use HTTPS for all webhook endpoints
- Implement proper error handling

### Payment Validation
- Always verify payment amounts
- Check payment status before granting access
- Implement proper error handling for failed payments

## Testing Checklist

- [ ] PayPal sandbox account creation
- [ ] Payment method selection works
- [ ] PayPal order creation
- [ ] Payment completion flow
- [ ] Course access granted after payment
- [ ] Webhook handling (if configured)
- [ ] Error handling for failed payments
- [ ] Production environment testing

## Troubleshooting

### Common Issues

1. **"Invalid Client ID" Error**
   - Check your PayPal credentials
   - Ensure you're using the correct environment (sandbox/live)

2. **Payment Not Completing**
   - Check webhook configuration
   - Verify return URLs are correct
   - Check server logs for errors

3. **Course Access Not Granted**
   - Verify payment capture is working
   - Check database for purchase records
   - Ensure webhook is properly configured

### Debug Mode

Enable debug logging by adding to your `.env`:
```env
DEBUG=paypal:*
```

## Support

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Support](https://www.paypal.com/support/)
- [PayPal Developer Community](https://developer.paypal.com/community/) 