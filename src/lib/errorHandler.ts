// @ts-expect-error ignore
export const handleNotFound = (req, res, next) => {
  const error = new Error("Not Found");
  next(error);
};
// @ts-expect-error ignore

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handleError = (error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
};
