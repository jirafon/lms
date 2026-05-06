export const sendSuccess = (res, { status = 200, message, ...payload } = {}) => {
  return res.status(status).json({
    success: true,
    ...(message ? { message } : {}),
    ...payload,
  });
};

export const sendError = (res, { status = 500, message, errors } = {}) => {
  return res.status(status).json({
    success: false,
    ...(message ? { message } : {}),
    ...(errors ? { errors } : {}),
  });
};

export const getMissingFields = (fields = {}) => {
  return Object.entries(fields)
    .filter(([, value]) => value === undefined || value === null || value === "")
    .map(([field]) => field);
};