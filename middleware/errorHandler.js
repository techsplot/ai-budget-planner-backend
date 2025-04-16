const errorHandler = (err, req, res, next) => {
    console.error(err.stack || err.message);
  
    const statusCode = err.statusCode || 500;
  
    res.status(statusCode).json({
      success: false,
      error: err.message || 'Something went wrong!',
    });
  };
  
  export default errorHandler;
  