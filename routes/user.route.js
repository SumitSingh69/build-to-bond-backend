import express from 'express'
import { 
	loginUser, 
	registerUser, 
	updateProfile,
	changePassword,
	updateLocation,
	getUserProfile,
	getPublicProfile,
	deactivateAccount,
	refreshProfile
} from '../controllers/user.controller.js';
import { IsAuthenticated } from '../middlewares/Auth.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile/:userId', getPublicProfile); // Public profile view

// Protected routes (authentication required)
router.use(IsAuthenticated); // Apply authentication middleware to all routes below

// Profile management
router.get('/profile', getUserProfile); // Get own profile
router.put('/profile', updateProfile); // Update profile
router.get('/refresh', refreshProfile); // Refresh profile data

// Location management
router.put('/location', updateLocation); // Update location only

// Account management
router.put('/change-password', changePassword); // Change password
router.put('/deactivate', deactivateAccount); // Deactivate account

export default router;
