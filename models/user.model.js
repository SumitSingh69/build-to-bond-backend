import mongoose from "mongoose";
import { hashPassword } from "../utils/bcrypt.js";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
    minlength: [2, "First name must be at least 2 characters"],
    maxlength: [50, "First name must be less than 50 characters"],
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
    minlength: [2, "Last name must be at least 2 characters"],
    maxlength: [50, "Last name must be less than 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+@.+\..+/, "Please enter a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false,
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"],
  },
  dob: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },
  bio: {
    type: String,
    maxlength: [500, "Bio must be less than 500 characters"],
  },
  interests: [
    {
      type: String,
      trim: true,
    },
  ],
  agePreferences: {
    min: {
      type: Number,
      default: 18,
      min: [18, "Minimum age must be at least 18"],
    },
    max: {
      type: Number,
      default: 99,
      max: [99, "Maximum age must be less than 100"],
    },
  },
  socialLinks: {
    instagram: { type: String, trim: true },
    facebook: { type: String, trim: true },
    twitter: { type: String, trim: true },
    linkedin: { type: String, trim: true },
  },
  subscription: {
    type: String,
    enum: ["free", "solara"],
    default: "free",
  },
  privacy: {
    type: String,
    enum: ["public", "private"],
    default: "public",
  },
  avatar: {
    type: String,
    default: "",
  },
  profilePicture: {
    type: String,
  },
  location: {
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    country: { type: String, trim: true },
  },
  lookingFor: {
    type: String,
    enum: ["friendship", "relationship", "casual", "other"],
    default: "relationship",
  },
  matches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  crushes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  likes: [{
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true,
    },
    likedAt: { 
      type: Date, 
      default: Date.now,
    },
  }],
  passedBy: [{
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
    },
    passedAt: { 
      type: Date, 
      default: Date.now,
    },
  }],

  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  height: {
    type: Number
  },
  occupation: {
    type: String,
    trim: true,
    maxlength: [100, "Occupation must be less than 100 characters"],
  },
  education: {
    type: String,
    enum: ["high_school", "bachelor", "master", "phd", "other"],
  },
  smoking: {
    type: String,
    enum: ["never", "sometimes", "regularly", "prefer_not_to_say"],
    default: "prefer_not_to_say",
  },
  drinking: {
    type: String,
    enum: ["never", "socially", "regularly", "prefer_not_to_say"],
    default: "prefer_not_to_say",
  },
  relationshipStatus: {
    type: String,
    enum: ["single", "divorced", "widowed"],
    default: "single",
  },
  children: {
    type: String,
    enum: ["none", "have_children", "want_children", "dont_want_children"],
    default: "none",
  },
  religion: {
    type: String,
    trim: true,
  },
  languages: [{
    type: String,
    trim: true,
  }],
  lastActive: {
    type: Date,
    default: Date.now,
  },
  profileCompleteness: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  }
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    if (this.password) {
      this.password = await hashPassword(this.password);
    }
  }
  next();
});

userSchema.methods.calculateProfileCompleteness = function() {
  let completeness = 0;
  const fields = [
    'firstName', 'lastName', 'email', 'dob', 'gender', 'bio',
    'interests', 'location.address', 'profilePicture', 'occupation',
    'height', 'education'
  ];
  
  fields.forEach(field => {
    if (this.get(field)) completeness += (100 / fields.length);
  });
  
  this.profileCompleteness = Math.round(completeness);
  return this.profileCompleteness;
};

userSchema.methods.omitPassword = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });

userSchema.index({ 
  isActive: 1, 
  gender: 1, 
  "dob": 1, 
});

userSchema.index({ 
  isActive: 1, 
  isVerified: 1, 
  profileCompleteness: -1 
});

userSchema.index({ 
  isPremium: 1, 
  lastActive: -1 
});

userSchema.index({ 
  "preferences.ageRange.min": 1, 
  "preferences.ageRange.max": 1 
});

userSchema.index({ 
  bio: "text", 
  interests: "text", 
  occupation: "text" 
});

userSchema.index({ lastActive: -1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1, isVerified: 1 });

userSchema.index({ profileCompleteness: -1 });

userSchema.index({ 
  isActive: 1, 
  isVerified: 1, 
  "preferences.genderPreference": 1, 
  gender: 1 
});

const User = mongoose.model("User", userSchema);
export default User;
