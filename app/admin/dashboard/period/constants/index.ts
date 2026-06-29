export const PERIODS_API_URL = 
  process.env.NEXT_PUBLIC_API_URL 
    ? `${process.env.NEXT_PUBLIC_API_URL}/attendance-periods`
    : "http://localhost:3434/attendance-periods";