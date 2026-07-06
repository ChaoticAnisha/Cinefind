// src/middleware/auth.ts
//
// This middleware checks that a request has a valid JWT token.
// Routes that need login protection use this as a "guard".
//
// How JWT works:
// 1. User logs in → server creates a token containing their user ID
// 2. Client stores this token (in localStorage or a cookie)
// 3. Every protected request sends the token in the Authorization header
// 4. This middleware verifies the token and attaches the user ID to the request

import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// Extend Express's Request type to include our userId field
export interface AuthRequest extends Request {
  userId?: string
}

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Token comes in the header like: "Bearer eyJhbGci..."
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]

  try {
    // jwt.verify checks the token is valid and not expired
    // If valid, it returns the payload we put in when creating the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    req.userId = decoded.userId
    next() // proceed to the actual route handler
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}