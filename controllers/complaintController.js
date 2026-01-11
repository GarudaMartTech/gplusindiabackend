const Complaint = require("../models/Complaint");
const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");
const sharp = require("sharp");
const config = require("../config/index");
const sendWhatsAppTemplate = require("../utils/sendWhatsAppTemplate");


// WHATSAPP TEMPLATES

const WHATSAPP_TEMPLATES = {
  RECEIVED: "complaint_received",
  IN_PROGRESS: "service_progress",
  RESOLVED: "services_resolved",
};


// AWS S3 CONFIG

const s3 = new AWS.S3({
  accessKeyId: config.KEY_ID,
  secretAccessKey: config.SECRECT_KEY,
  region: config.REGION,
});


// FORMAT MOBILE

const formatMobile = (mobile) => {
  if (!mobile) return null;
  return mobile.startsWith("91") ? mobile : `91${mobile}`;
};


// IMAGE COMPRESSION 

const compressImage = async (buffer, type = "product") => {
  const maxSizeKB = type === "bill" ? 80 : 50;
  let quality = 80;
  let output;

  do {
    output = await sharp(buffer)
      .rotate()
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();

    quality -= 5;
  } while (output.length / 1024 > maxSizeKB && quality >= 40);

  return output;
};


// CREATE COMPLAINT

exports.createComplaint = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Login required" });

    const {
      customerName,
      mobile,
      productName,
      district,
      state,
      pinCode,
      serialNumber,
      storeNumber,
      showroomAddress,
      description,
      orderId,
    } = req.body;

    if (
      !customerName ||
      !mobile ||
      !district ||
      !state ||
      !pinCode ||
      !storeNumber ||
      !productName ||
      !serialNumber ||
      !showroomAddress ||
      !description
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    
    // UPLOAD + COMPRESS IMAGES
    
    let images = [];

    if (req.files?.length) {
      for (const file of req.files) {
        const key = `complaints/${uuidv4()}.jpg`;

        const isBill =
          file.fieldname === "bill" ||
          file.originalname.toLowerCase().includes("bill") ||
          file.originalname.toLowerCase().includes("invoice");

        const compressedBuffer = await compressImage(
          file.buffer,
          isBill ? "bill" : "product"
        );

        const uploadResult = await s3
          .upload({
            Bucket: config.BUCKET_NAME,
            Key: key,
            Body: compressedBuffer,
            ContentType: "image/jpeg",
          })
          .promise();

        images.push({
          key,
          url: uploadResult.Location,
          sizeKB: Math.round(compressedBuffer.length / 1024),
          type: isBill ? "bill" : "product",
        });
      }
    }

    
    // SAVE COMPLAINT
    
    const complaint = await Complaint.create({
      complaintId: "GPLUS-" + Date.now(),
      customer: req.user._id,
      customerName,
      mobile,
      district,
      state,
      pinCode,
      productName,
      serialNumber,
      storeNumber,
      showroomAddress,
      orderId: orderId || "NA",
      description,
      images,
      status: "RECEIVED",
      timeline: [{ status: "RECEIVED", date: new Date() }],
    });

    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      complaint,
    });

    
    // WHATSAPP NOTIFICATION
    
    try {
      await sendWhatsAppTemplate(
  formatMobile(complaint.mobile),
  WHATSAPP_TEMPLATES.RECEIVED,
  complaint.complaintId,
  complaint.customerName
);
    } catch (err) {
      console.error("WhatsApp Error:", err?.response?.data || err.message);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// MY COMPLAINTS

exports.myComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      customer: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({ success: true, complaints });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// SINGLE COMPLAINT

exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate(
      "customer",
      "name phone"
    );

    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });

    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ALL COMPLAINTS (ADMIN)

exports.allComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("customer", "name phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, complaints });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// UPDATE STATUS

exports.updateStatus = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });

    const status = req.body.status;
    if (!["RECEIVED", "IN_PROGRESS", "RESOLVED"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    complaint.status = status;
    complaint.timeline.push({ status, date: new Date() });
    await complaint.save();

    res.json({ success: true, complaint });

    const template = WHATSAPP_TEMPLATES[status];
    if (template) {
      try {
        await sendWhatsAppTemplate(
          formatMobile(complaint.mobile),
          template,
          complaint.complaintId,
          complaint.customerName
        );
      } catch (err) {
        console.error("WhatsApp Error:", err?.response?.data || err.message);
      }
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// SUBMIT FEEDBACK

exports.submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });

    if (complaint.customer.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    if (complaint.status !== "RESOLVED")
      return res
        .status(400)
        .json({ message: "Complaint not resolved yet" });

    if (complaint.feedback?.submittedAt)
      return res
        .status(400)
        .json({ message: "Feedback already submitted" });

    if (rating < 1 || rating > 5)
      return res.status(400).json({ message: "Invalid rating" });

    await Complaint.updateOne(
      { _id: complaint._id },
      {
        $set: {
          feedback: {
            rating,
            comment,
            submittedAt: new Date(),
          },
        },
      },
      { runValidators: false }
    );

    res.json({
      success: true,
      message: "Feedback submitted successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
