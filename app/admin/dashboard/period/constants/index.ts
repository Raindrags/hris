export const PERIODS_API_URL = 
  process.env.BACKEND_API_URL 
    ? `${process.env.BACKEND_API_URL}/attendance-periods`
    : "https://hris.maitreyawirads.dpdns.org/attendance-periods";