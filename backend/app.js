const express = require("express");
// const Product = require("./models/productModel.js");
const connectDb = require("./database/db.js");
// const products = require("./routers/productRoute.js");
const errorMiddleware = require("./middleware/error.js");
const userRouter = require("./routers/userRoute.js");
const config = require("./config/index.js");
// const stripe = require("stripe")(config.STRIPE_SECRECT_KEY);
// const Order = require("./routers/orderRoute.js");
// const OrderModel = require("./models/orderModel.js");
// const Payment = require("./routers/paymentRoute.js");
// const productCategory = require("./routers/productCategoryRoute.js");
// var cookieSession = require('cookie-session')
const bodyParser = require("body-parser");
// const productSpecification = require("./routers/productSpecificationRouter.js");
const cookieParser = require("cookie-parser");
const sendEmail = require("./utils/sendEmail.js");
// const Blog = require("./routers/blogRouter.js");
// const productModel = require("./models/productModel.js");
// const brands = require("./routers/BrandRouter.js");
// const shippingAddress = require("./routers/ShippingAddressRoute.js")
// const reviews = require("./routers/reviewRouter.js")
// const Cart = require("./routers/cartRouter.js")
// const fs = require("fs");
// const Product = require("./models/productModel.js");
require('dotenv').config();
const cors = require("cors");
// const CategoryModel = require("./models/CategoryModel.js");
const app = express();
connectDb();

// create order
// const createOrder = async (customer, data) => {
//   // console.log("Hello customer", customer);
//   const Items = JSON.parse(customer.metadata.cart);
//   //   console.log("customer.metadata", customer.metadata);
//   //   console.log(Items);
//   //   console.log("customer", customer);

//   //   console.log("data item ", data);

//   //   console.log("data item",data)
//   // const compressedBuffer = Buffer.from(customer.metadata.cart, "base64");

//   // // Decompress the string using gzip
//   // zlib.gunzip(compressedBuffer, (err, decompressed) => {
//   //   if (err) {
//   //     console.error("Error decompressing cart:", err);
//   //     return;
//   //   }

//   //   const cartItems = JSON.parse(decompressed.toString());
//   //   console.log(cartItems);

//   //   // Now you have the cart items array back in its original form
//   // });
//   // const Item = JOSN.parse(customer.address)
//   // console.log("data", data.invoice);
//   // const invoiceId = parseInt(data.invoice)

//   const invoices = await stripe.invoices.retrieve(data.invoice);
//   //   console.log("Hello invoice", invoices);

//   const order = [];
//   Items &&
//     Items.forEach((item) => {
//       //   console.log("order item name", item);
//       order.push({
//         name: item.name,
//         price: item.price,
//         quantity: item.quantity,
//         image: item.image,
//         product: item.product,
//         MRP: item.cutoffprice,
//       });
//     });

//   const newOrder = new OrderModel({
//     user: customer.metadata.user_id,
//     shippingInfo: {
//       address: customer?.address?.line1,
//       city: customer?.address?.city,
//       state: customer?.address?.state,
//       country: customer?.address?.country,
//       pinCode: customer?.address?.postal_code,
//       phoneNo: customer?.phone || " ",
//     },
//     totalPrice: data?.amount_subtotal,
//     taxPrice: "",
//     itemsPrice: Items && Items.forEach((item) => item.price),
//     shippingPrice: "free",
//     orderItems: order,
//     paymentInfo: {
//       id: data.payment_intent,
//       status: data.payment_status,
//     },
//     invoice: invoices.invoice_pdf,
//   });

//   try {
//     const data = await newOrder.save();
//     // console.log("order item" , data)

//     // console.log("data items :", data);
//     // const invoice = await stripe.invoices.retrieve((data.invoice))
//     // console.log("invoice ",invoice)
//     const date = new Date(data.createAt);
//     const formateDate = date.toDateString();

//     const emailContent = `
//       <html>
//         <head>
//         </head>
//         <body style="font-family: Arial, sans-serif;">
//         <div style="width: 80%;">
//         <h1 style="font-size: 24px; text-align: center;">Gshoppi</h1>
//         <p style="font-size: 20px;">Hi ${customer.name},</p>
//         <p style="font-size: 17px;">Thank you for your recent purchase. We are pleased to confirm that your order has been successfully placed and is currently being processed. Below are the details of your order.
//         </p>
//         <p style="font-size: 18px;">Team Gshoppi .</p>
//     </div>
//     <div style="display: flex; justify-content: space-between; background-color: rgba(193, 193, 193, 0.927); padding: 10px; margin: 20px auto; width: 80%;">
//         <div style="width: 48%;">
//             <p style="font-size: 17px;"><strong>Order ID:</strong> ${
//               data._id
//             }</p>
//             <p style="font-size: 17px;"><strong>Order Date:</strong> ${formateDate}</p>
//         </div>
//         <div style="width: 48%;">
//             <h2 style="font-size: 17px;">Shipping Address:</h2>
//             <p>${customer.name}</p>
//             <p>${data.shippingInfo.address}, ${data.shippingInfo.city}, ${
//       data.shippingInfo.state
//     }, ${data.shippingInfo.pinCode}</p>
//             <p>Mobile: ${data.shippingInfo.phoneNo}</p>
//         </div>
//     </div>
//     <div style="border: 2px; padding: 10px;">
//         <h2 style="font-size: 20px;">Your Gshoppi.com Order Details</h2>
//         ${data.orderItems
//           .map(
//             (item) => `
//             <div style="display: flex; align-items: center; margin-bottom: 20px;">
//                 <img src="${item.image}" alt="${
//               item.name
//             }" style="width: 200px; height: 200px; object-fit: cover; margin-right: 10px;">
//                 <div>
//                     <h3 style="font-size: 18px;">${item.name}</h3>
//                     <p style="font-size: 16px;">Quantity: ${item.quantity}</p>
//                     <p style="font-size: 16px;">Price : <s style="margin-right: 2px">₹ ${
//                       item.MRP
//                     }</s> ₹ ${item.price}  <p style="color:green">${(
//               ((item.MRP - item.price) / item.MRP) *
//               100
//             ).toFixed()} % off </p> </p>
//                 </div>
//             </div>
//         `
//           )
//           .join("")}
//     </div>
//     <div style="margin: 30px auto; width: 80%; text-align: right;">
//         <p style="font-size: 17px;"><strong style="margin-right: 100px">Total Items:</strong> ${data.orderItems.reduce(
//           (acc, item) => acc + item.quantity,
//           0
//         )}</p>
//         <p style="font-size: 15px; "><strong style="margin-right: 80px">Shipping Charge:</strong>₹ <p style="color:green">Free</p></p>
//         <hr style="border: 1px solid black;">
//         <p style="font-size: 15px;"><strong style="margin-right: 100px">Total:</strong>₹ ${(
//           data.totalPrice / 100
//         ).toFixed(2)} </p>
//     </div>
//     <div style="display: flex; align-items: center; justify-content: center;">
//         <div style="width: 30%; text-align: left;">
//             <h2 style="font-size: 20px;">Contact Us</h2>
//             <div style="">
//                 <p style="font-size: 17px;">Email:</p>
//                 <a href="mailto:support@gshoppi.com">support@gshoppi.com</a>
//             </div>
//         </div>
//         <div style="background-color: rgba(193, 193, 193, 0.927); height: 100%;  width: 2px;"></div>
//         <div style="width: 30%; margin-left: 10px;"> 
//             <p>Gshoppi</p>
//         </div>
//     </div>
//         </body>
//       </html>
//     `;
//     //  const emailContent = JSON.stringify(data, null, 2)
//     await sendEmail({
//       email: customer.email,
//       subject: `Your gshoppi.com Order Confirmation, orderId: ${data._id}`,
//       text: "Gshoppi Order Confirmation",
//       html: emailContent,
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };
// "whsec_1EEBOVkMHx6X9flpUOIuyfcnpzQh5pSO";
// "whsec_OFxpp1GYUHjpFujCrf3hsCarg1qC68uu";
let endpointSecret = "whsec_OFxpp1GYUHjpFujCrf3hsCarg1qC68uu";
// "whsec_8b1e1b2658ef2a08766595bffef4665b45c5b2098f709f737a4e1628254809db";

// app.post(
//   "/api/v1/webhook",
//   express.raw({ type: "application/json" }),
//   async (req, res) => {
//     let sig = req.headers["stripe-signature"];

//     let data;
//     let eventType;

//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//       //   console.log("event", event);
//       data = event.data.object;
//       eventType = event.type;  
//     } catch (err) {
//       res.status(400).send(`Webhook Error: ${err.message}`);
//       return;
//     }

//     // Handle the event
//     // checkout.session.completed
//     if (eventType === "checkout.session.completed") {
//       stripe.customers
//         .retrieve(data.customer)
//         .then((customer) => {
//           //   console.log("customer data", customer);
//           //   console.log("data.items", data);
//           createOrder(customer, data);
//         })
//         .catch((err) => {
//           console.log(err.message);
//         });
//       // const product = data

//       // console.log(product)
//     }

//     // Return a 200 res to acknowledge receipt of the event
//     res.send().end();
//   }
// );

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "200mb" }));
app.use(cors());

// app.use(fileUpload())

// product router

// async function updateHightLightProduct() {
//   try {
//     const public_id = new mongoose.Types.ObjectId().toHexString();

//     const product = await Product.find();
//     // console.log("product",product)
//     // await collection.findOne({_id: new ObjectId(productId)})
//     for (let i in product) {
//       if (product[i] && product[i].highlight) {
//             // console.log(product[i].highlight)
//       } else {
//         console.log("Product or color array not found.");
//       }
//     }
//   } catch(error) {
//     console.log(error)
//   }
// }

// updateHightLightProduct();
// async function updateidProductBrand() {
  // const product = await productModel.find()

  // for( let i in product){
  //   console.log(product[i]._id)
  // }
  // const items = await productModel.findByIdAndUpdate(
  //   "6581387da02a3e7d21ac6d07",
  //   "6620c9b9b5faa19306e8d3d5",
  //   { new: true, runValidators: true, useFindAndModify: false }
  // );

  // items.save();
// }

// updateidProductBrand();

// updateColorStructure(productIdToUpdate);


// update brand id for all products
// async function productBrandId(){
//   const data = await Product.find().populate("brands")
//   // console.log("All Product", data)
  
//   let dataItems= []
//  data.forEach(async(product)=>{
//   if(!product.brands){
    

//    const datas = product.brands = {id: "6620c9b9b5faa19306e8d3d5"}
//   const id = product._id
//   //  await Product.findByIdAndUpdate(id,datas);
    

//   }else if(!product.brands._id){
//     product.brands._id = "6620c9b9b5faa19306e8d3d5"
//   }
//  }
 

//   )
//   console.log(data)
 
//   // console.log(dataItems)
// } 
  


// app.use("/api/v1", products);
// app.use("/api/v1", reviews)
// app.use("/api/v1", productCategory);
// app.use("/api/v1", productSpecification);
app.use("/api/v1", userRouter);
// app.use("/api/v1", Order);
// app.use("/api/v1", Payment);
// app.use("/api/v1", Blog);
// app.use("/api/v1", brands);
// app.use("/api/v1",shippingAddress);
// app.use("/api/v1/",Cart);
// app.use(bodyParser.json({ limit: "20mb" }));
// app.use(bodyParser.urlencoded({ extended: false, limit: "20mb" }));

// async function seo() {
//   const categorys = await CategoryModel.find();
//   // console.log(categorys)
//   const products = await Product.find();
//   const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
//    <urlset
//       xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
//       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
//       xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
//             http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
//     <!-- created with Free Online Sitemap Generator www.xml-sitemaps.com -->
//    <url>
//   <loc>https://gshoppi.com/</loc>
//   <lastmod>2024-04-13T12:16:54+00:00</lastmod>
//    </url>
//    <url>
//    <loc>https://gshoppi.com/login</loc>
//   <lastmod>2024-04-13T12:16:54+00:00</lastmod>
// </url>
// <url>
//    <loc>https://gshoppi.com/register</loc>
//   <lastmod>2024-04-13T12:16:54+00:00</lastmod>
// </url>
// <url>
//    <loc>https://gshoppi.com/profile</loc>
//   <lastmod>2024-04-13T12:16:54+00:00</lastmod>
// </url>
// <url>
//    <loc>https://gshoppi.com/password/forgot</loc>
//   <lastmod>2024-04-13T12:16:54+00:00</lastmod>
// </url>
// <url>
//    <loc>https://gshoppi.com/profile</loc>
//   <lastmod>2024-04-13T12:16:54+00:00</lastmod>
// </url>
// <url>
//    <loc>https://gshoppi.com/wishlist</loc>
//   <lastmod>2024-04-13T12:16:54+00:00</lastmod>
// </url>
// <url>
//    <loc>https://gshoppi.com/cart</loc>
//   <lastmod>2024-04-13T12:16:54+00:00</lastmod>
// </url>
// <url>
//    <loc>https://gshoppi.com/shipping-details</loc>
//   <lastmod>2024-04-13T12:16:54+00:00</lastmod>
// </url>
// <url>
//    <loc>https://gshoppi.com/order/confirm</loc>
//   <lastmod>2024-04-13T12:16:54+00:00</lastmod>
// </url>
// <url>
//    <loc>https://gshoppi.com/orders</loc>
//   <lastmod>2024-04-13T12:16:54+00:00</lastmod>
// </url>
// <url>
//    <loc>https://gshoppi.com/process/payment</loc>
//   <lastmod>2024-04-13T12:16:54+00:00</lastmod>
// </url>
// <url>
//    <loc>https://gshoppi.com/success</loc>
//   <lastmod>2024-04-13T12:16:54+00:00</lastmod>
// </url>
// <url>
//    <loc>https://gshoppi.com/cancle</loc>
//   <lastmod>2024-04-13T12:16:54+00:00</lastmod>
// </url>
//    <url>
//    <loc>https://gshoppi.com/about-us</loc>
//   <lastmod>2024-04-13T12:16:54+00:00</lastmod>
// </url>
// <url>
//    <loc>https://gshoppi.com/contact-us</loc>
//   <lastmod>2024-04-13T12:16:54+00:00</lastmod>
// </url>
// <url>
//    <loc>https://gshoppi.com/privacy-policy</loc>
//   <lastmod>2024-04-13T12:16:54+00:00</lastmod>
// </url>
// <url>
//    <loc>https://gshoppi.com/terms-conditions</loc>
//   <lastmod>2024-04-13T12:16:54+00:00</lastmod>
// </url>
// <url>
//    <loc>https://gshoppi.com/cancellations-return-policy</loc>
//   <lastmod>2024-04-13T12:16:54+00:00</lastmod>
// </url>
// <url>
//    <loc>https://gshoppi.com/shipping</loc>
//   <lastmod>2024-04-13T12:16:54+00:00</lastmod>
// </url>
// <url>
//    <loc>https://gshoppi.com/products/search</loc>
//   <lastmod>2024-04-13T12:16:54+00:00</lastmod>
// </url>
// <url>
//       <loc>https://gshoppi.com/products/search/:keyword</loc>
//       <changefreq>weekly</changefreq>
//       <priority>0.8</priority>
//     </url>
// ${products
//   .map((product) => {
//     return `
//     <url>
//         <loc>${`https://gshoppi.com/product/${product._id}`}</loc>
//   <lastmod>2024-04-13T12:16:54+00:00</lastmod>
//     </url>
//     <url>
//         <loc>${`https://gshoppi.com/product/${product.slug}/${product._id}`}</loc>
//   <lastmod>2024-04-13T12:16:54+00:00</lastmod>
//     </url>
//   `;
//   })
//   .join("")}
//   ${categorys.map((cat) => {
//     return `
//       <url>
//       <loc>${`https://gshoppi.com/product-category/${cat.slug} `} </loc>
//   <lastmod>2024-04-13T12:16:54+00:00</lastmod>
//       </url>
//       `;
//   })}
//    </urlset>

//   `;

//   fs.writeFileSync("../frontend/public/sitemap.xml", sitemap);
//   console.log("genarated Sitemap successfully");
//   return;
// }

// seo();

// Error middleware
app.use(errorMiddleware);

module.exports = app;
