const sendSuccess = (res, data, message = "Success", statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

const sendError = (res, message, statusCode = 500, errors) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendError };
