const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const storeSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      required: true,
      trim: true,
    },

    storeAddress: {
      type: String,
      required: true,
      trim: true,
    },

    storeCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      default: "STORE",
    },

    city: {
      type: String,
      required: true,
    },

    mobile: {
      type: String,
      required: true,
    },

    active: {
      type: Boolean,
      default: true,
    },

    assignedComplaints: [
      {
        complaint: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Complaint",
        },
        assignedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

/* PASSWORD HASH */
storeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

/*  PASSWORD MATCH */
storeSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Store", storeSchema);
