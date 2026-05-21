import express from 'express';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// TODO: add POST /logout if you go with httpOnly cookies
//   (if using localStorage tokens, logout is handled client-side only)

export default router;
