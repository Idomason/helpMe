export const aliasTopHelpers = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-createdAt,role';
  req.query.fields = 'name,email,role';

  next();
};
