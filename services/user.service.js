import { Env } from '../config/env.config.js';
import User from '../models/user.model.js';
import { UnauthorizedException } from '../utils/AppError.js';
import { comparePassword } from '../utils/bcrypt.js';
import jwt from 'jsonwebtoken';

export const registerService = async (userData) => {
	const { 
		email, 
		firstName, 
		lastName, 
		password
	} = userData;

	try {
		const existingUser = await User.findOne({ email });

		if (existingUser) {
			throw new UnauthorizedException("User with this email already exists");
		}

		const newUser = new User({
			firstName,
			lastName,
			email,
			password
		});

		await newUser.save();

		const userObj = newUser.toObject();
		delete userObj.password;

		return {
			user: userObj
		};

	} catch (error) {
		throw error;
	}
}

export const loginService = async (credentials) => {
	const { email, password } = credentials;

	try {
		const user = await User.findOne({ email }).select("+password");

		if (!user) {
			throw new UnauthorizedException("Invalid email or password");
		}

		const isMatch = await comparePassword(password, user.password);

		if (!isMatch) {
			throw new UnauthorizedException("Invalid email or password");
		}

        const token = jwt.sign(
        { userId: (user._id).toString() }, 
        Env.JWT_SECRET, 
        {
          expiresIn: Env.JWT_EXPIRES_IN,
        }
      );

		const userObj = user.toObject();
		delete userObj.password;

		return {
			user: userObj,
            accessToken : token,
            expiresAt : Env.JWT_EXPIRES_IN
		};

	} catch (error) {
		throw error;
	}
};

export const updateProfileService = async (userId, profileData) => {
	const { 
		dob, 
		gender,
		bio,
		interests,
		profilePicture,
		avatar,
		location,
		agePreferences,
		socialLinks,
		privacy,
		lookingFor
	} = profileData;

	try {
		const user = await User.findById(userId);

		if (!user) {
			throw new UnauthorizedException("User not found");
		}

		// Update only provided fields
		const updateData = {};
		if (dob) updateData.dob = dob;
		if (gender) updateData.gender = gender;
		if (bio !== undefined) updateData.bio = bio;
		if (interests) updateData.interests = interests;
		if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
		if (avatar !== undefined) updateData.avatar = avatar;
		if (location !== undefined) updateData.location = location;
		if (agePreferences) updateData.agePreferences = agePreferences;
		if (socialLinks) updateData.socialLinks = socialLinks;
		if (privacy) updateData.privacy = privacy;
		if (lookingFor) updateData.lookingFor = lookingFor;

		const updatedUser = await User.findByIdAndUpdate(
			userId, 
			updateData, 
			{ new: true, runValidators: true }
		).select('-password');

		return {
			user: updatedUser
		};

	} catch (error) {
		throw error;
	}
};