import { IsNull } from "typeorm";
import { AppDataSource } from "../db";
import { User } from '../entities/User';
import type { LoginModel } from "../models/login.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from 'express';
import type { RegisterModel } from "../models/register.model";

const repo = AppDataSource.getRepository(User);
const tokenSecret = process.env.JWT_SECRET as string;
const accessTTL = process.env.JWT_ACCESS_TIME_TO_LIVE || '15m';
const refreshTTL = process.env.JWT_REFRESH_TIME_TO_LIVE || '7d';

export class UserService {
    static async login(model: LoginModel) {
        console.log('Attempting login for email:', model.email); // Debugging log
      
        const user = await this.getUserByEmail(model.email);
      
        if (!user) {
          console.error('User not found for email:', model.email);
          throw new Error('Invalid email or password');
        }
      
        const isPasswordValid = await bcrypt.compare(model.password, user.password!);
        if (!isPasswordValid) {
          console.error('Invalid password for email:', model.email);
          throw new Error('Invalid email or password');
        }
      
        const payload = {
          id: user.userId,
          email: user.email,
        };
      
        // Generate access and refresh tokens
        const access = jwt.sign(payload, tokenSecret, { expiresIn: accessTTL });
        const refresh = jwt.sign(payload, tokenSecret, { expiresIn: refreshTTL });
      
        // Save the refresh token in the database
        user.refreshToken = refresh;
        await repo.save(user);
      
        console.log('Login successful for email:', model.email); // Debugging log
      
        return {
          name: user.email,
          access,
          refresh,
        };
      }

  static async logout(userId: number) {
    const user = await repo.findOneBy({ userId });

    if (!user) {
      throw new Error('User not found');
    }

    // Remove the refresh token from the database
    user.refreshToken = null;
    await repo.save(user);
  }

  static async verifyToken(req: any, res: Response, next: NextFunction) {
    const whitelist = ['/api/user/login', '/api/user/signup', '/api/user/refresh', '/api/user/register'];

    // Use req.url if req.path is unavailable
    const path = req.path || req.url;

    if (whitelist.includes(path)) {
      next();
      return;
    }

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        message: 'NO_TOKEN_FOUND',
        timestamp: new Date(),
      });
      return;
    }

    jwt.verify(token, tokenSecret, (err: any, user: any) => {
      if (err) {
        res.status(403).json({
          message: 'INVALID_TOKEN',
          timestamp: new Date(),
        });
        return;
      }

      // Attach the user to the request object
      req.user = user;
      next();
    });
  }

  static async refreshToken(token: string) {
    try {
      console.log('Refreshing token:', token); // Debugging log
  
      const decoded: any = jwt.verify(token, tokenSecret);
      const user = await this.getUserByEmail(decoded.email);
  
      if (!user || user.refreshToken !== token) {
        console.error('Invalid refresh token'); // Debugging log
        throw new Error('INVALID_REFRESH_TOKEN');
      }
  
      const payload = {
        id: user.userId,
        email: user.email,
      };
  
      console.log('Refresh token valid. Generating new access token...'); // Debugging log
  
      return {
        name: user.email,
        access: jwt.sign(payload, tokenSecret, { expiresIn: accessTTL }),
        refresh: token,
      };
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        console.error('Refresh token expired:', error.message); // Debugging log
        throw new Error('REFRESH_TOKEN_EXPIRED');
      }
  
      console.error('Failed to refresh token:', error.message); // Debugging log
      throw new Error('REFRESH_FAILED');
    }
  }


  static async register(model: RegisterModel) {
    const data = await repo.existsBy({
      email: model.email,
      deletedAt: IsNull(),
    });
  
    if (data) {
      throw new Error('USER_EXISTS');
    }
  
    const hashed = await bcrypt.hash(model.password, 12);
    const user = await repo.save({
      email: model.email,
      password: hashed,
      phone: model.phone,
    });
  
    return { userId: user.userId }; // Return the `userId` of the newly created user
  }
  
  static async getUserByEmail(email: string) {
    console.log(`Searching for user with email: ${email}`); // Debugging log

    const user = await repo.findOne({
      where: {
        email,
        deletedAt: IsNull(),
      },
    });

    if (!user) {
      console.error(`User not found for email: ${email}`); // Debugging log
      throw new Error('User not found');
    }

    console.log(`User found: ${user.email}`); // Debugging log
    return user;
  }
}