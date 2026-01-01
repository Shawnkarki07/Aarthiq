import { Request, Response, NextFunction } from 'express';
import { submitInterest } from '../services/interest.service';

/**
 * POST /api/interests
 * Submit investor interest form
 */
export const submitInterestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { businessId, investorName, phoneNumber, email, remarks } = req.body;

    const interest = await submitInterest({
      businessId,
      investorName,
      phoneNumber,
      email,
      remarks
    });

    return res.status(201).json({
      message: 'Interest submitted successfully',
      interest: {
        id: interest.id,
        businessName: interest.businessName,
        submittedAt: interest.submittedAt
      }
    });
  } catch (error) {
    next(error);
  }
};
