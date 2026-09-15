import { supabase } from '../config/supabase.js';
import { catchAsync } from '../utils/catchAsync.js';

const BUCKET_MAP = {
  request: 'request-images',
  giveaway: 'giveaway-images',
  profile: 'profile-images',
  verification: 'verification-docs',
  submission: 'submission-proof',
};

const PRIVATE_BUCKETS = new Set(['verification-docs']);

export const uploadImage = catchAsync(async (req, res, next) => {
  if (!req.file)
    return res.status(400).json({ success: false, message: 'Please upload a valid file' });

  const type = req.body.type || 'request';
  const bucket = BUCKET_MAP[type] || 'request-images';
  const isPrivate = PRIVATE_BUCKETS.has(bucket);

  // Namespace private (verification) files under the user's id
  const prefix = isPrivate && req.user?._id ? `${req.user._id}/` : '';
  const fileName = `${prefix}${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
      cacheControl: '3600',
    });

  if (error)
    return res.status(500).json({ success: false, message: error.message });

  let url;
  if (isPrivate) {
    // Private bucket: return a time-limited signed URL (7 days)
    const { data: signed } = await supabase.storage
      .from(bucket)
      .createSignedUrl(fileName, 60 * 60 * 24 * 7);
    url = signed?.signedUrl || null;
  } else {
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    url = urlData.publicUrl;
  }

  return res.status(200).json({
    success: true,
    data: { url, publicId: `${bucket}/${fileName}` },
    message: 'Upload successful',
  });
});
