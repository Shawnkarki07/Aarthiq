import { Request, Response, NextFunction } from 'express';
import { loginUser } from '../services/auth.service';

/**
 * POST /api/auth/login
 * Login user (Business or Admin)
 */
export const loginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await loginUser(email, password);

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username
      },
      // Auth token format for API requests (temporary stub format)
      authToken: `${user.id}|${user.email}|${user.role}`
    });
  } catch (error) {
    next(error);
  }
};
