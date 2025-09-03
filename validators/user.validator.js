import { z } from "zod";

export const UserRegistrationSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z\d]/,
      "Password must contain at least one special character"
    ),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number")
    .min(10, "Phone number must be at least 10 digits"),
});

export const UpdateProfileSchema = z.object({
  dob: z.coerce
    .date()
    .refine((date) => {
      const age = new Date().getFullYear() - date.getFullYear();
      return age >= 18 && age <= 99;
    }, "Age must be between 18 and 99 years")
    .optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  interests: z
    .array(z.string().trim())
    .max(20, "Maximum 20 interests allowed")
    .optional(),

  profilePicture: z
    .string()
    .url("Profile picture must be a valid URL")
    .optional(),
  avatar: z.string().optional(),

  location: z
    .object({
      address: z.string().trim().optional(),
      city: z.string().trim().optional(),
      country: z.string().trim().optional(),
    })
    .optional(),

  agePreferences: z
    .object({
      min: z
        .number()
        .min(18, "Minimum age must be at least 18")
        .max(99)
        .optional(),
      max: z
        .number()
        .min(18, "Maximum age must be at least 18")
        .max(99)
        .optional(),
    })
    .refine((data) => !data.min || !data.max || data.min <= data.max, {
      message: "Minimum age must be less than or equal to maximum age",
    })
    .optional(),

  socialLinks: z
    .object({
      instagram: z.string().url("Instagram URL must be valid").optional(),
      facebook: z.string().url("Facebook URL must be valid").optional(),
      twitter: z.string().url("Twitter URL must be valid").optional(),
      linkedin: z.string().url("LinkedIn URL must be valid").optional(),
    })
    .optional(),

  privacy: z.enum(["public", "private"]).optional(),
  lookingFor: z
    .enum(["friendship", "relationship", "casual", "other"])
    .optional(),

  height: z
    .number()
    .min(100, "Height must be at least 100cm")
    .max(250, "Height must be less than 250cm")
    .optional(),

  occupation: z
    .string()
    .trim()
    .max(100, "Occupation must be less than 100 characters")
    .optional(),
  education: z
    .enum(["high_school", "bachelor", "master", "phd", "other"])
    .optional(),

  smoking: z
    .enum(["never", "sometimes", "regularly", "prefer_not_to_say"])
    .optional(),
  drinking: z
    .enum(["never", "socially", "regularly", "prefer_not_to_say"])
    .optional(),

  relationshipStatus: z.enum(["single", "divorced", "widowed"]).optional(),
  children: z
    .enum(["none", "have_children", "want_children", "dont_want_children"])
    .optional(),
  religion: z
    .string()
    .trim()
    .max(50, "Religion must be less than 50 characters")
    .optional(),
  languages: z
    .array(z.string().trim())
    .max(10, "Maximum 10 languages allowed")
    .optional(),

  subscription: z.enum(["free", "solara"]).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z\d]/,
      "Password must contain at least one special character"
    ),
});

export const LocationUpdateSchema = z.object({
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  country: z.string().trim().optional(),
});
