
import mongoose from 'mongoose';
import { hashPassword } from '../utils/bcrypt.js';

const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: [true, 'First name is required'],
		trim: true,
		minlength: [2, 'First name must be at least 2 characters'],
		maxlength: [50, 'First name must be less than 50 characters']
	},
	lastName: {
		type: String,
		required: [true, 'Last name is required'],
		trim: true,
		minlength: [2, 'Last name must be at least 2 characters'],
		maxlength: [50, 'Last name must be less than 50 characters']
	},
	email: {
		type: String,
		required: [true, 'Email is required'],
		unique: true,
		trim: true,
		lowercase: true,
		match: [/.+@.+\..+/, 'Please enter a valid email address']
	},
	password: {
		type: String,
		required: [true, 'Password is required'],
		minlength: [8, 'Password must be at least 8 characters'],
		select: false
	},
	dob: {
		type: Date
	},
	gender: {
		type: String,
		enum: ['male', 'female', 'other']
	},
	bio: {
		type: String,
		maxlength: [500, 'Bio must be less than 500 characters']
	},
	interests: [{
		type: String,
		trim: true
	}],
	agePreferences: {
		min: {
			type: Number,
			default: 18,
			min: [18, 'Minimum age must be at least 18']
		},
		max: {
			type: Number,
			default: 99,
			max: [99, 'Maximum age must be less than 100']
		}
	},
	socialLinks: {
		instagram: { type: String, trim: true },
		facebook: { type: String, trim: true },
		twitter: { type: String, trim: true },
		linkedin: { type: String, trim: true }
	},
	subscription: {
		type: String,
		enum: ['free', 'solara'],
		default: 'free'
	},
	privacy: {
		type: String,
		enum: ['public', 'private'],
		default: 'public'
	},
	avatar: {
		type: String,
		default: ''
	},
	profilePicture: {
		type: String
	},
	location: {
		type: String,
		trim: true
	},
	lookingFor: {
		type: String,
		enum: ['friendship', 'relationship', 'casual', 'other'],
		default: 'relationship'
	},
	matches: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}],
	isActive: {
		type: Boolean,
		default: true
	},
	createdAt: {
		type: Date,
		default: Date.now
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

const User = mongoose.model('User', userSchema);
export default User;
