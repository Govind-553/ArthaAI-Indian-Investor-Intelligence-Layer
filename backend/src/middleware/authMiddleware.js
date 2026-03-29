import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { UserRepository } from '../repositories/UserRepository.js';

const defaultUserRepository = new UserRepository();

export const authenticate = async (req, _res, next) => {
  try {
    const userRepository = req.app?.locals?.userRepository || defaultUserRepository;
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Authorization token is required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await userRepository.findById(decoded.sub);

    if (!user) {
      throw new AppError('User not found for provided token', 401);
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error.name === 'JsonWebTokenError' ? new AppError('Invalid token', 401) : error);
  }
};
