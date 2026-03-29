import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  generateToken(user) {
    return jwt.sign({ sub: user._id, email: user.email }, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn,
    });
  }

  sanitizeUser(user) {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async register(payload) {
    const existingUser = await this.userRepository.findByEmail(payload.email);
    if (existingUser) {
      throw new AppError('User already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(payload.password, 12);
    const user = await this.userRepository.create({
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
    });

    return {
      user: this.sanitizeUser(user),
      token: this.generateToken(user),
    };
  }

  async login(payload) {
    const user = await this.userRepository.findByEmail(payload.email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(payload.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    return {
      user: this.sanitizeUser(user),
      token: this.generateToken(user),
    };
  }
}
