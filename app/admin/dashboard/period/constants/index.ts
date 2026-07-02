export const PERIODS_API_URL = 
  process.env.BACKEND_API_URL 
    ? `${process.env.BACKEND_API_URL}/attendance-periods`
    : "http://localhost:3434/attendance-periods";