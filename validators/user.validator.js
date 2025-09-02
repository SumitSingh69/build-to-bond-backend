
import { z } from 'zod';

export const UserRegistrationSchema = z.object({
	firstName: z.string().min(2).max(50),
	lastName: z.string().min(2).max(50),
	email: z.string().email(),
	password: z.string()
		.min(8, "Password must be at least 8 characters")
		.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
		.regex(/[a-z]/, "Password must contain at least one lowercase letter")
		.regex(/\d/, "Password must contain at least one number")
		.regex(/[^A-Za-z\d]/, "Password must contain at least one special character")
});

export const UpdateProfileSchema = z.object({
	dob: z.coerce.date().optional(),
	gender: z.enum(['male', 'female', 'other']).optional(),
	bio: z.string().max(500).optional(),
	interests: z.array(z.string()).optional(),
	profilePicture: z.string().optional(),
	avatar: z.string().optional(),
	location: z.string().optional(),
	agePreferences: z.object({
		min: z.number().min(18).max(99).optional(),
		max: z.number().min(18).max(99).optional()
	}).optional(),
	socialLinks: z.object({
		instagram: z.string().optional(),
		facebook: z.string().optional(),
		twitter: z.string().optional(),
		linkedin: z.string().optional()
	}).optional(),
	privacy: z.enum(['public', 'private']).optional(),
	lookingFor: z.enum(['friendship', 'relationship', 'casual', 'other']).optional()
});

export const LoginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8)
});
