import { AsyncHandler } from "../middlewares/AsyncHandler.middleware.js";
import {
  registerService,
  loginService,
  updateProfileService,
  changePasswordService,
  updateLocationService,
  getUserProfileService,
  deactivateAccountService,
  getAllUsersService,
  findUserByIdService,
  refreshTokenService,
  logoutService,
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

export const fetchAllUsers = AsyncHandler(async (req, res) => {
  const { page = 1, limit = 5 } = req.query;
  const result = await getAllUsersService(
    parseInt(page),
    parseInt(limit),
    req.user._id
  );

  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: result.message,
    data: result.users,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
    totalUsers: result.totalUsers,
    hasNextPage: result.hasNextPage,
    hasPreviousPage: result.hasPreviousPage,
    nextPage: result.hasNextPage ? page + 1 : null,
    prevPage: result.hasPreviousPage ? page - 1 : null,
  });
});

export const findUserById = AsyncHandler(async (req, res) => {
  const result = await findUserByIdService(req.params.id);
  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: result.message,
    data: result.user,
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

export const refreshToken = AsyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      success: false,
      message: "Refresh token is required",
    });
  }

  const result = await refreshTokenService(refreshToken);
  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: "Tokens refreshed successfully",
    data: result,
  });
});

export const logoutUser = AsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const result = await logoutService(userId);
  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: result.message,
  });
});
