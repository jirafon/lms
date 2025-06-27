import Stripe from "stripe";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";
import { createPayPalOrder, capturePayPalPayment, getPayPalOrder } from "../utils/paypal.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId, paymentMethod = 'stripe' } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found!" });

    // Create a new course purchase record
    const newPurchase = new CoursePurchase({
      courseId,
      userId,
      amount: course.coursePrice,
      status: "pending",
      paymentMethod
    });

    let paymentData;

    if (paymentMethod === 'stripe') {
      // Create a Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: course.courseTitle,
                images: course.courseThumbnail ? [course.courseThumbnail] : [],
              },
              unit_amount: Math.round(course.coursePrice * 100), // Amount in cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/course-progress/${courseId}`,
        cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/course-detail/${courseId}`,
        metadata: {
          courseId: courseId,
          userId: userId,
        },
        shipping_address_collection: {
          allowed_countries: ["US", "CA", "GB", "DE", "FR", "ES", "IT", "AU", "JP", "IN"], // Expanded countries
        },
      });

      if (!session.url) {
        return res
          .status(400)
          .json({ success: false, message: "Error while creating Stripe session" });
      }

      paymentData = {
        url: session.url,
        paymentId: session.id
      };

    } else if (paymentMethod === 'paypal') {
      // Create a PayPal order
      const paypalOrder = await createPayPalOrder(course);
      
      paymentData = {
        url: paypalOrder.links.find(link => link.rel === 'approve').href,
        paymentId: paypalOrder.id
      };
    } else {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid payment method. Supported methods: 'stripe', 'paypal'" 
      });
    }

    // Save the purchase record
    newPurchase.paymentId = paymentData.paymentId;
    await newPurchase.save();

    return res.status(200).json({
      success: true,
      url: paymentData.url,
      paymentId: paymentData.paymentId,
      paymentMethod
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      success: false, 
      message: "Error creating checkout session" 
    });
  }
};

export const capturePayPalPaymentHandler = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ 
        success: false, 
        message: "Order ID is required" 
      });
    }

    // Capture the PayPal payment
    const capture = await capturePayPalPayment(orderId);
    
    if (capture.status === 'COMPLETED') {
      // Find the purchase record
      const purchase = await CoursePurchase.findOne({
        paymentId: orderId,
        paymentMethod: 'paypal'
      }).populate({ path: "courseId" });

      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      // Update purchase status
      purchase.status = "completed";
      purchase.paymentDetails = {
        captureId: capture.purchase_units[0].payments.captures[0].id,
        captureStatus: capture.status,
        captureAmount: capture.purchase_units[0].payments.captures[0].amount.value
      };
      await purchase.save();

      // Make all lectures visible by setting `isPreviewFree` to true
      if (purchase.courseId && purchase.courseId.lectures.length > 0) {
        await Lecture.updateMany(
          { _id: { $in: purchase.courseId.lectures } },
          { $set: { isPreviewFree: true } }
        );
      }

      // Update user's enrolledCourses
      await User.findByIdAndUpdate(
        purchase.userId,
        { $addToSet: { enrolledCourses: purchase.courseId._id } },
        { new: true }
      );

      // Update course to add user ID to enrolledStudents
      await Course.findByIdAndUpdate(
        purchase.courseId._id,
        { $addToSet: { enrolledStudents: purchase.userId } },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Payment completed successfully",
        purchase
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment was not completed"
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      success: false, 
      message: "Error capturing PayPal payment" 
    });
  }
};

export const stripeWebhook = async (req, res) => {
  let event;

  try {
    const payloadString = JSON.stringify(req.body, null, 2);
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    const header = stripe.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret,
    });

    event = stripe.webhooks.constructEvent(payloadString, header, secret);
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  // Handle the checkout session completed event
  if (event.type === "checkout.session.completed") {
    console.log("Stripe checkout session complete is called");

    try {
      const session = event.data.object;

      const purchase = await CoursePurchase.findOne({
        paymentId: session.id,
        paymentMethod: 'stripe'
      }).populate({ path: "courseId" });

      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      if (session.amount_total) {
        purchase.amount = session.amount_total / 100;
      }
      purchase.status = "completed";
      purchase.paymentDetails = {
        sessionId: session.id,
        paymentIntentId: session.payment_intent,
        customerEmail: session.customer_details?.email
      };

      // Make all lectures visible by setting `isPreviewFree` to true
      if (purchase.courseId && purchase.courseId.lectures.length > 0) {
        await Lecture.updateMany(
          { _id: { $in: purchase.courseId.lectures } },
          { $set: { isPreviewFree: true } }
        );
      }

      await purchase.save();

      // Update user's enrolledCourses
      await User.findByIdAndUpdate(
        purchase.userId,
        { $addToSet: { enrolledCourses: purchase.courseId._id } },
        { new: true }
      );

      // Update course to add user ID to enrolledStudents
      await Course.findByIdAndUpdate(
        purchase.courseId._id,
        { $addToSet: { enrolledStudents: purchase.userId } },
        { new: true }
      );
    } catch (error) {
      console.error("Error handling Stripe event:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  res.status(200).send();
};

export const paypalWebhook = async (req, res) => {
  try {
    const event = req.body;
    
    // Handle PayPal webhook events
    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      console.log("PayPal payment capture completed");
      
      const capture = event.resource;
      const orderId = capture.supplementary_data?.related_ids?.order_id;
      
      if (orderId) {
        const purchase = await CoursePurchase.findOne({
          paymentId: orderId,
          paymentMethod: 'paypal'
        }).populate({ path: "courseId" });

        if (purchase && purchase.status === 'pending') {
          purchase.status = "completed";
          purchase.paymentDetails = {
            captureId: capture.id,
            captureStatus: capture.status,
            captureAmount: capture.amount.value
          };
          await purchase.save();

          // Make all lectures visible
          if (purchase.courseId && purchase.courseId.lectures.length > 0) {
            await Lecture.updateMany(
              { _id: { $in: purchase.courseId.lectures } },
              { $set: { isPreviewFree: true } }
            );
          }

          // Update user's enrolledCourses
          await User.findByIdAndUpdate(
            purchase.userId,
            { $addToSet: { enrolledCourses: purchase.courseId._id } },
            { new: true }
          );

          // Update course to add user ID to enrolledStudents
          await Course.findByIdAndUpdate(
            purchase.courseId._id,
            { $addToSet: { enrolledStudents: purchase.userId } },
            { new: true }
          );
        }
      }
    }
    
    res.status(200).send();
  } catch (error) {
    console.error("PayPal webhook error:", error);
    res.status(500).send();
  }
};

export const getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const course = await Course.findById(courseId)
      .populate({ path: "creator" })
      .populate({ path: "lectures" });

    const purchased = await CoursePurchase.findOne({ 
      userId, 
      courseId,
      status: 'completed'
    });
    console.log(purchased);

    if (!course) {
      return res.status(404).json({ message: "course not found!" });
    }

    return res.status(200).json({
      course,
      purchased: !!purchased, // true if purchased, false otherwise
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllPurchasedCourse = async (req, res) => {
  try {
    const userId = req.id;
    const purchasedCourse = await CoursePurchase.find({
      userId,
      status: "completed",
    }).populate("courseId");
    
    if (!purchasedCourse) {
      return res.status(200).json({
        purchasedCourse: [],
      });
    }
    return res.status(200).json({
      purchasedCourse,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = [
      {
        id: 'stripe',
        name: 'Credit/Debit Card',
        description: 'Pay with Visa, Mastercard, American Express, and more',
        icon: '💳'
      },
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'Pay with your PayPal account or credit card',
        icon: '🅿️'
      }
    ];

    return res.status(200).json({
      success: true,
      paymentMethods
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
