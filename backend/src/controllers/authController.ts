import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Book } from '../models';
import { config } from '../config/config';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required fields.',
      });
      return;
    }

    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials. No account found with this email.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials. Incorrect password.',
      });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        joined_date: user.joined_date,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error occurred during login.',
    });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Book,
          as: 'books',
        },
      ],
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User profile not found.' });
      return;
    }

    res.json({
      success: true,
      user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching user profile.',
    });
  }
};

export const getDemoAccounts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const authors = await User.findAll({
      where: { role: 'author' },
      attributes: ['id', 'name', 'email', 'city'],
      include: [{ model: Book, as: 'books', attributes: ['id', 'title', 'status'] }],
      limit: 10,
    });

    res.json({
      success: true,
      admin: {
        email: 'admin@bookleaf.com',
        password: 'admin123',
        description: 'BookLeaf Support Ops Administrator',
      },
      sampleAuthors: authors.map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        password: 'password123',
        books: a.get('books'),
      })),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching demo accounts.',
    });
  }
};
