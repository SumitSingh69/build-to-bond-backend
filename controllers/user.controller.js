import { AsyncHandler } from "../middlewares/AsyncHandler.middleware.js";
import {
  registerService,
  loginService,
  updateProfileService,
  changePasswordService,
  updateLocationService,
  getUserProfileService,
  deactivateAccountService,
} from "../services/user.service.js";
import {
  LoginSchema,
  UserRegistrationSchema,
  UpdateProfileSchema,
  PasswordChangeSchema,
  LocationUpdateSchema,
} from "../validators/user.validator.js";
import { HTTPSTATUS } from "../config/Https.config.js";

export const registerUser = AsyncHandler(async (req, res) => {
  const body = UserRegistrationSchema.parse(req.body);
  const result = await registerService(body);
  res.status(HTTPSTATUS.CREATED).json({
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

export const loginUser = AsyncHandler(async (req, res) => {
  const body = LoginSchema.parse(req.body);
  const result = await loginService(body);
  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

export const updateProfile = AsyncHandler(async (req, res) => {
  const body = UpdateProfileSchema.parse(req.body);
  const userId = req.user._id;
  const result = await updateProfileService(userId, body);
  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: result.message,
    data: result,
  });
});

export const changePassword = AsyncHandler(async (req, res) => {
  const body = PasswordChangeSchema.parse(req.body);
  const userId = req.user._id;
  const result = await changePasswordService(userId, body);
  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: result.message,
  });
});

export const updateLocation = AsyncHandler(async (req, res) => {
  const body = LocationUpdateSchema.parse(req.body);
  const userId = req.user._id;
  const result = await updateLocationService(userId, body);
  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: result.message,
    data: result,
  });
});

export const getUserProfile = AsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const result = await getUserProfileService(userId);
  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: "Profile retrieved successfully",
    data: result,
  });
});

export const getPublicProfile = AsyncHandler(async (req, res) => {
  const { userId } = req.params;
  const result = await getUserProfileService(userId);

  const publicProfile = {
    ...result.user,
    email: undefined,
    phone: undefined,
    agePreferences: undefined,
    privacy: undefined,
    socialLinks: undefined,
    matches: undefined,
    crushes: undefined,
    likes: undefined,
    passedBy: undefined,
  };

  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: "Public profile retrieved successfully",
    data: { user: publicProfile },
  });
});

export const deactivateAccount = AsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const result = await deactivateAccountService(userId);
  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: result.message,
  });
});

export const refreshProfile = AsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const result = await getUserProfileService(userId);
  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: "Profile refreshed successfully",
    data: result,
  });
});
