export const checkBody = async (req, res, next) => {
  const { name, price } = req.body;

  if (!name || !price) {
    return res
      .status(400)
      .json({ success: false, message: 'no name or price' });
  }

  next();
};
