declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'ADMIN' | 'BUSINESS';
        username?: string;
      };
    }
  }
}

export {};
