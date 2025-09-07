import { Env } from "../config/env.config.js";
import User from "../models/user.model.js";
import {
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from "../utils/AppError.js";
import { comparePassword } from "../utils/bcrypt.js";
import jwt from "jsonwebtoken";

export const registerService = async (userData) => {
  const { email, firstName, lastName, password, phone } = userData;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestException("User with this email already exists");
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      throw new BadRequestException(
        "User with this phone number already exists"
      );
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
    });

    await newUser.save();

    newUser.calculateProfileCompleteness();
    await newUser.save();

    const userObj = newUser.omitPassword();

    return {
      user: userObj,
      message:
        "Registration successful. Please complete your profile to get better matches.",
    };
  } catch (error) {
    throw error;
  }
};

export const loginService = async (credentials) => {
  const { email, password } = credentials;

  try {
    const user = await User.findOne({
      email,
      isActive: true,
    }).select("+password");

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException("Invalid email or password");
    }

    user.lastActive = new Date();
    
    // Generate both access and refresh tokens
    const accessToken = jwt.sign({ userId: user._id.toString() }, Env.JWT_SECRET, {
      expiresIn: Env.JWT_EXPIRES_IN,
    });
    
    const refreshToken = user.generateRefreshToken();
    await user.save();

    const userObj = user.omitPassword();

    return {
      user: userObj,
      accessToken,
      refreshToken,
      expiresAt: Env.JWT_EXPIRES_IN,
      profileCompleteness: user.profileCompleteness,
    };
  } catch (error) {
    throw error;
  }
};

export const updateProfileService = async (userId, profileData) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    if (profileData.location) {
      const currentLocation = user.location || {};
      user.location = {
        ...currentLocation,
        ...profileData.location,
      };
      delete profileData.location;
    }

    if (profileData.agePreferences) {
      const currentAgePrefs = user.agePreferences || {};
      user.agePreferences = {
        ...currentAgePrefs,
        ...profileData.agePreferences,
      };
      delete profileData.agePreferences;
    }

    if (profileData.socialLinks) {
      const currentSocialLinks = user.socialLinks || {};
      user.socialLinks = {
        ...currentSocialLinks,
        ...profileData.socialLinks,
      };
      delete profileData.socialLinks;
    }

    Object.keys(profileData).forEach((key) => {
      if (profileData[key] !== undefined) {
        user[key] = profileData[key];
      }
    });

    user.lastActive = new Date();

    user.calculateProfileCompleteness();

    const updatedUser = await user.save();

    return {
      user: updatedUser.omitPassword(),
      profileCompleteness: updatedUser.profileCompleteness,
      message: "Profile updated successfully",
    };
  } catch (error) {
    throw error;
  }
};

export const getAllUsersService = async (page, limit) => {
  try {
    if (page < 1 || limit < 1 || limit > 100) {
      throw new BadRequestException("Invalid page or limit value");
    }
    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);
    if (page > totalPages) {
      throw new BadRequestException("Page number exceeds total pages");
    }
    const skip = (page - 1) * limit;
    const users = await User.find().skip(skip).limit(limit).select("-password");
    if (users.length === 0) {
      throw NotFoundException("No users found");
    }
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    return {
      page: page,
      limit: limit,
      users: users,
      message: "Users fetched successfully",
      totalPages: totalPages,
      totalUsers: totalUsers,
      hasNextPage: hasNextPage,
      hasPreviousPage: hasPreviousPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPreviousPage ? page - 1 : null,
    };
  } catch (error) {
    throw error;
  }
};

export const findUserByIdService = async (userId) => {
  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return {
      user: user,
      message: "User fetched successfully",
    };
  } catch (error) {
    throw error;
  }
};
export const changePasswordService = async (userId, passwordData) => {
  const { currentPassword, newPassword } = passwordData;

  try {
    const user = await User.findById(userId).select("+password");

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const isMatch = await comparePassword(currentPassword, user.password);

    if (!isMatch) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    return {
      message: "Password changed successfully",
    };
  } catch (error) {
    throw error;
  }
};

export const updateLocationService = async (userId, locationData) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    user.location = {
      ...user.location,
      ...locationData,
    };

    user.lastActive = new Date();
    const updatedUser = await user.save();

    return {
      user: updatedUser.omitPassword(),
      message: "Location updated successfully",
    };
  } catch (error) {
    throw error;
  }
};

export const getUserProfileService = async (userId) => {
  try {
    const user = await User.findById(userId)
      .populate("matches", "firstName lastName profilePicture")
      .populate("crushes", "firstName lastName profilePicture");

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return {
      user: user.omitPassword(),
      profileCompleteness: user.profileCompleteness,
    };
  } catch (error) {
    throw error;
  }
};

export const deactivateAccountService = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    user.isActive = false;
    await user.save();

    return {
      message: "Account deactivated successfully",
    };
  } catch (error) {
    throw error;
  }
};

export const refreshTokenService = async (refreshToken) => {
  try {
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token is required");
    }

    const user = await User.findOne({
      refreshToken,
      isActive: true,
    }).select("+refreshToken +refreshTokenExpiresAt");

    if (!user) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    if (!user.isRefreshTokenValid(refreshToken)) {
      // Clear invalid refresh token
      user.clearRefreshToken();
      await user.save();
      throw new UnauthorizedException("Refresh token has expired");
    }

    // Generate new access token
    const accessToken = jwt.sign({ userId: user._id.toString() }, Env.JWT_SECRET, {
      expiresIn: Env.JWT_EXPIRES_IN,
    });

    // Generate new refresh token for rotation
    const newRefreshToken = user.generateRefreshToken();
    user.lastActive = new Date();
    await user.save();

    const userObj = user.omitPassword();

    return {
      user: userObj,
      accessToken,
      refreshToken: newRefreshToken,
      expiresAt: Env.JWT_EXPIRES_IN,
    };
  } catch (error) {
    throw error;
  }
};

export const logoutService = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    user.clearRefreshToken();
    await user.save();

    return {
      message: "Logged out successfully",
    };
  } catch (error) {
    throw error;
  }
};
