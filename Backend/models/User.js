import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const { Schema, model } = mongoose;

// Sub-schema for user addresses (no separate _id for each)
const addressSchema = new Schema(
  {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please provide first name"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Please provide last name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    addresses: [addressSchema],
    profileImage: {
      type: String,
      default: null,
    },
    recentlyViewed: [{
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
      },
      viewedAt: {
        type: Date,
        default: Date.now
      }
    }],
  },
  {
    timestamps: true,
  }
);

/**
 * Hash password before saving if modified.
 */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
});

/**
 * Compare entered password with hashed password.
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcryptjs.compare(enteredPassword, this.password);
};

/**
 * Remove sensitive fields when converting to JSON.
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = model("User", userSchema);

export default User;
