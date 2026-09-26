class ApiResponse {
  static success(res, statusCode = 200, payload = {}) {
    return res.status(statusCode).json({ success: true, ...payload });
  }

  static error(res, statusCode = 500, message = "Something went wrong", details = null) {
    const response = {
      success: false,
      message,
    };

    if (details) {
      response.details = details;
    }

    return res.status(statusCode).json(response);
  }
}

module.exports = ApiResponse;
