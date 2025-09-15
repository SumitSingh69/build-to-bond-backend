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
  updatePersonalityScoreService,
} from "../services/user.service.js";
import {
  LoginSchema,
  UserRegistrationSchema,
  UpdateProfileSchema,
  PasswordChangeSchema,
  LocationUpdateSchema,
  getAllUserSchema,
  SubmitFeedbackSchema,
} from "../validators/user.validator.js";
import {
  getPendingFeedbacksService,
  updateFeedbackScoreService,
<<<<<<< HEAD
  updateSearchTypeService,
=======
>>>>>>> 983a1706cb3043fc82f78edc29ac1c445838e2a0
} from "../services/userBehaviour.service.js";
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
  const body = getAllUserSchema.parse(req.query);
  const {
    page = 1,
    limit = 10,
    ageMin,
    ageMax,
    genderPreference,
    lookingFor,
    heightMin,
    heightMax,
    education,
    smoking,
    drinking,
    children,
    relationshipStatus,
    interests,
    religion,
    languages,
    isVerified,
    lastActiveWithin,
    minProfileCompleteness,
    city,
    country,
  } = body;

  const filters = {};

  filters._id = { $ne: req.user._id };
  if (ageMin || ageMax) {
    const now = new Date();
    const minDOB = new Date(now.setFullYear(now.getFullYear() - ageMax));
    const maxDOB = new Date(
      new Date().setFullYear(new Date().getFullYear() - ageMin)
    );
    filters.dateOfBirth = {};
    if (ageMin) filters.dateOfBirth.$lte = maxDOB;
    if (ageMax) filters.dateOfBirth.$gte = minDOB;
  }
  if (genderPreference) filters.gender = genderPreference;
  if (lookingFor) filters.lookingFor = lookingFor;
  if (heightMin || heightMax) {
    filters.height = {};
    if (heightMin) filters.height.$gte = Number(heightMin);
    if (heightMax) filters.height.$lte = Number(heightMax);
  }
  if (education) {
    const educationArray = Array.isArray(education)
      ? education
      : education.split(",");
    filters.education = { $in: educationArray };
  }
  if (smoking) {
    const smokingArray = Array.isArray(smoking) ? smoking : smoking.split(",");
    filters.smoking = { $in: smokingArray };
  }
  if (drinking) {
    const drinkingArray = Array.isArray(drinking)
      ? drinking
      : drinking.split(",");
    filters.drinking = { $in: drinkingArray };
  }
  if (children) {
    const childrenArray = Array.isArray(children)
      ? children
      : children.split(",");
    filters.children = { $in: childrenArray };
  }
  if (relationshipStatus) filters.relationshipStatus = relationshipStatus;
  if (interests) {
    const interestsArray = Array.isArray(interests)
      ? interests
      : interests.split(",");
    filters.interests = { $in: interestsArray };
  }
  if (religion) filters.religion = religion;
  if (languages) {
    const languagesArray = Array.isArray(languages)
      ? languages
      : languages.split(",");
    filters.languages = { $in: languagesArray };
  }

  if (isVerified) filters.isVerified = isVerified === "true";

  // Last active filter
  if (lastActiveWithin) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(lastActiveWithin));
    filters.lastActive = { $gte: cutoff };
  }

  // Profile completeness
  if (minProfileCompleteness) {
    filters.profileCompleteness = { $gte: Number(minProfileCompleteness) };
  }

  // Location filter (if you store geo coords as { type: "Point", coordinates: [lng, lat] })
  if (city || country) {
    if (city) filters.city = city;
    if (country) filters.country = country;
  }

  const result = await getAllUsersService(
    parseInt(page),
    parseInt(limit),
    filters
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
  const otherUserId = req.params;
  const userId = req.user._id;
  console.log(otherUserId.userId);
  const result = await getUserProfileService(otherUserId.userId);

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
  console.log("wtf");
  const score = publicProfile.personailityScore;
  if (score) {
    await updateSearchTypeService(userId, score);
  }

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
export const getPendingFeedbacks = AsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const result = await getPendingFeedbacksService(userId);
  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: "Pending feedbacks retrieved",
    data: result,
  });
});
export const submitPendingFeedbacks = AsyncHandler(async (req, res) => {
  //validate the request body first using zod
<<<<<<< HEAD
  const feedbacks = SubmitFeedbackSchema.parse(req.body);
  console.log(feedbacks);
  const userId = req.user._id;
  //call the service to submit feedback
  const result = await updateFeedbackScoreService(userId, feedbacks.feedbacks);
  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: result.message,
  });
});
const optionScores = {
  "Strongly Disagree": 0,
  Disagree: 0.25,
  Neutral: 0.5,
  Agree: 0.75,
  "Strongly Agree": 1,
};

export const updatePersonalityScore = AsyncHandler(async (req, res) => {
  const { answers } = req.body;

  if (!answers || !Array.isArray(answers)) {
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      success: false,
      message: "Answers must be an array",
    });
  }

  const userId = req.user._id;

  let totalScore = 0;

  for (const response of answers) {
    if (optionScores[response] !== undefined) {
      totalScore += optionScores[response];
    }
  }

  const averageScore = answers.length > 0 ? totalScore / answers.length : 0;

  const result = await updatePersonalityScoreService(userId, totalScore);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: result.message,
=======
  const body = SubmitFeedbackSchema.parse(req.body);
  const userId = req.user._id;
  //call the service to submit feedback
  const result = await updateFeedbackScoreService(userId, body);
  return res.status(HTTPSTATUS.OK).json({
    success: true,
    data: result,
>>>>>>> 983a1706cb3043fc82f78edc29ac1c445838e2a0
  });
});
