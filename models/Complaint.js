const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    
    
    complaintId: {
      type: String,
      required: true,
      unique: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    district: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    pinCode: {
      type: String,
      required: true,
      trim: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    serialNumber: {
      type: String,
      required: true,
      trim: true,
    },

    storeNumber: {
      type: String,
      required: true,
      trim: true,
    },

    showroomAddress: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    
    images: [
      {
        key: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],

    
    status: {
      type: String,
      enum: ["RECEIVED", "IN_PROGRESS", "RESOLVED"],
      default: "RECEIVED",
    },

    assignedLevel: {
      type: String,
      enum: ["HO", "STATE", "DISTRICT"],
      default: "HO",
    },

    assignedState: {
      type: String,
    },

    assignedDistrict: {
      type: String,
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    
    timeline: [
      {
        status: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },

      experience: [
        {
          type: String,
          enum: [
            "Quick Service",
            "Polite Technician",
            "Issue Fully Resolved",
            "Good Communication",
            "Satisfied Overall",
          ],
        },
      ],

      comment: {
        type: String,
        trim: true,
      },

      submittedAt: {
        type: Date,
      },
    },

   
    referral: {
      friendName: {
        type: String,
        trim: true,
      },
      friendMobile: {
        type: String,
        trim: true,
      },
      referredAt: {
        type: Date,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
