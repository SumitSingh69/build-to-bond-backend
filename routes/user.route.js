import express from 'express'
import { loginUser, registerUser, updateProfile } from '../controllers/user.controller.js';
import { IsAuthenticated } from '../middlewares/Auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile', IsAuthenticated, updateProfile);

export default router;
