import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/appError';

// Get all requests
export const getAllRequests = catchAsync(async (req, res, next) => {
  const requests = await Request.find({});
});

// Create a request
export const createRequest = catchAsync(async (req, res, next) => {
  const {
    category,
    image,
    name,
    requestDescription,
    specificDetails,
    city,
    state,
    country,
  } = req.body;

  try {
    const request = await Request.create(req.body);
  } catch (error) {
        console.log(`Error in request controller: ${error.message}`);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
  }
});

// Get a request
export const getRequest = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const request = await Request.findById(id).populate({
    path: 'user',
    select: 'votes comments.user',
  });

  if (!request) {
    return next(new AppError('Request not found', 404));
  }

  return res.status(200).json({ status: 'success', data: { request } });
});

// Update a request
export const updateRequest = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedRequest = await Request.findByIdAndUpdate(id, req.body);
});

// Delete a request
export const deleteRequest = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await Request.findByIdAndDelete(id);
});
