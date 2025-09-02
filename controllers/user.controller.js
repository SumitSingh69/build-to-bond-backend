
import { AsyncHandler } from "../middlewares/AsyncHandler.middleware.js";
import { registerService, loginService, updateProfileService } from "../services/user.service.js";
import { LoginSchema, UserRegistrationSchema, UpdateProfileSchema } from "../validators/user.validator.js";
import { HTTPSTATUS } from "../config/Https.config.js";

export const registerUser = AsyncHandler(
  async (req, res) => {
    const body = UserRegistrationSchema.parse(req.body);
    const result = await registerService(body);
    res
      .status(HTTPSTATUS.CREATED)
      .json({ message: "User registered successfully", data: result });
  }
);

export const loginUser = AsyncHandler(
  async (req, res) => {
    const body = LoginSchema.parse(req.body);
    const result = await loginService(body);
    res
      .status(HTTPSTATUS.OK)
      .json({ message: "User logged in successfully", data: result });
  }
);

export const updateProfile = AsyncHandler(
  async (req, res) => {
    const body = UpdateProfileSchema.parse(req.body);
    const userId = req.user._id;
    const result = await updateProfileService(userId, body);
    res
      .status(HTTPSTATUS.OK)
      .json({ message: "Profile updated successfully", data: result });
  }
);