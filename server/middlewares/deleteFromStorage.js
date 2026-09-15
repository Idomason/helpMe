import { supabase } from '../config/supabase.js';
import { catchAsync } from '../utils/catchAsync.js';

export const deleteFromStorage = catchAsync(async (req, res, next) => {
  if (!req.user?.profile_img_path) {
    return next();
  }

  const [bucket, ...pathParts] = req.user.profile_img_path.split('/');
  const filePath = pathParts.join('/');

  if (!filePath) return next();

  try {
    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) console.error(`Error deleting image from storage: ${error.message}`);
  } catch (err) {
    console.error(`Error deleting image from storage: ${err}`);
  }

  next();
});
