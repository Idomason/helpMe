import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import Request from '../models/requestModel.js';
import User from '../models/userModel.js';

// Get all requests
export const getAllRequests = catchAsync(async (req, res, next) => {
  const requests = await Request.find({});
  if (!requests) return next(new AppError('No request found', 404));

  return res.status(200).json({ status: 'success', data: { requests } });
});

// Create a request
export const createRequest = catchAsync(async (req, res, next) => {
  try {
    const {
      name,
      category,
      requestDescription,
      city,
      state,
      country,
      specificDetails,
      image,
    } = req.body;

    if (!req.body) {
      return next(new AppError('No valid request data', 400));
    }

    const request = await Request.create({
      user: req.user._id,
      name,
      category,
      requestDescription,
      city,
      state,
      country,
      specificDetails,
      image,
    });

    if (!request) {
      return next(new AppError('Request creation failed', 400));
    }
    return res.status(201).json({ status: 'success', data: { request } });
  } catch (error) {
    console.log(error);
  }
});

// Get a request
export const getRequest = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const request = await Request.findById(id)
    .populate('user', 'name email') // Fetch request owner
    .populate('votes', 'name') // Fetch voters
    .populate('comments.user', 'name email'); // Fetch commenters

  if (!request) {
    return next(new AppError('Request not found', 404));
  }

  return res.status(200).json({ status: 'success', data: { request } });
});

// Update a request
export const updateOwnRequest = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const request = await Request.findById(id);
  if (!request || !request.user !== userId)
    return next(new AppError('You are not authorized', 403));

  const updatedRequest = await Request.findByIdAndUpdate(
    id,
    {
      user: req.user._id,
      name,
      category,
      requestDescription,
      city,
      state,
      country,
      specificDetails,
      image,
    },
    { new: true },
  );

  if (!updatedRequest)
    return next(new AppError('Request update failed, please try again', 400));

  return res.status(200).json({
    status: 'success',
    message: 'Request update successful',
    data: { updatedRequest },
  });
});

// Delete a request
export const deleteOwnRequest = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id; // Assuming authentication middleware is used.

  const request = await Request.findById(id);
  if (!request || !request.user !== userId)
    return next(new AppError('You are not authorized', 401));

  const deletedRequest = await Request.findByIdAndDelete(id);
  if (!deletedRequest)
    return next(
      new AppError('Failed to delete request, please try again', 400),
    );

  return res.status(200).json({ message: 'Request deleted successfully' });
});

// Vote a request
export const voteRequest = catchAsync(async (req, res, next) => {
  const { requestId } = req.params;
  const userId = req.user._id; // Assuming user is authenticated

  try {
    const request = await Request.findById(requestId);
    if (!request) return next(new AppError('Request not found', 404));

    if (request.user.toString() === userId.toString()) {
      return next(new AppError("You can't vote your own request", 400));
    }

    const hasVoted = request.votes.includes(userId);

    if (hasVoted) {
      // Remove vote
      // await Request.findByIdAndUpdate(requestId, { $pull: { votes: userId } });
      request.votes.pull(userId);
    } else {
      // Add vote
      // await Request.findByIdAndUpdate(requestId, {
      //   $addToSet: { votes: userId },
      // });
      request.votes.push(userId);
    }

    // Save request to db
    await request.save();

    return res.status(200).json({
      message: hasVoted
        ? 'Vote removed successfully'
        : 'Vote added successfully',
      votes: request.votes,
    });
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
});

// Comment on a request - (To be revamped/optimized)
export const commentRequest = catchAsync(async (req, res, next) => {
  const { requestId } = req.params;
  const { text } = req.body;
  const userId = req.user._id; // Assuming user is authenticated

  if (!text) return next(new AppError('Comment text is required', 400));

  const updatedRequest = await Request.findByIdAndUpdate(
    requestId,
    { $push: { comments: { text, user: userId } } },
    { new: true },
  ).populate('comments.user', 'name'); // Populating user details

  return res.status(201).json({
    status: 'success',
    message: 'Commented successfully',
    data: updatedRequest.comments,
  });
});

// To fetch a request including votes and comments with user details:
// app.get('/requests/:requestId', async (req, res) => {
//   try {
//     const request = await Request.findById(req.params.requestId)
//       .populate('user', 'name email') // Fetch request owner
//       .populate('votes', 'name') // Fetch voters
//       .populate('comments.user', 'name email'); // Fetch commenters

//     if (!request) return res.status(404).json({ message: 'Request not found' });

//     res.json(request);
//   } catch (error) {
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// To allow users to edit their comments:

export const editOwnComment = catchAsync(async (req, res, next) => {
  const { requestId, commentId } = req.params;
  const { text } = req.body;
  const userId = req.user._id; // Assuming authentication middleware is used

  if (!text) return next(new AppError('Comment text is required', 400));

  // Find the request and update the comment
  const updatedRequest = await Request.findOneAndUpdate(
    { _id: requestId, 'comments._id': commentId, 'comments.user': userId }, // Ensure the user owns the comment
    { $set: { 'comments.$.text': text } }, // Update the comment text
    { new: true },
  ).populate('comments.user', 'name email');

  if (!updatedRequest)
    return next(new AppError('Comment not found or unauthorized', 404));

  return res.json({
    status: 'success',
    message: 'comment edited successfully',
    data: updatedRequest.comments,
  });
});

// To allow users to delete their own comments:
export const deleteOwnComment = catchAsync(async (req, res, next) => {
  const { requestId, commentId } = req.params;
  const userId = req.user._id; // Assuming authentication middleware is used

  // Find the request and remove the comment
  const updatedRequest = await Request.findByIdAndUpdate(
    requestId,
    { $pull: { comments: { _id: commentId, user: userId } } }, // Only remove if the user owns the comment
    { new: true },
  ).populate('comments.user', 'name email');

  if (!updatedRequest)
    return next(new AppError('Comment not found or unauthorized', 404));

  return res.status(200).json({
    status: 'success',
    message: 'Comment deleted successfully',
    comments: updatedRequest.comments,
  });
});

// An admin to be able to delete any comment:
export const adminDeleteComment = catchAsync(async (req, res, next) => {
  const { requestId, commentId } = req.params;
  const userId = req.user._id; // Assuming authentication
  const user = await User.findById(userId);

  if (!user || user.role !== 'admin') {
    return next(new AppError('Access denied', 403));
  }

  const updatedRequest = await Request.findByIdAndUpdate(
    requestId,
    { $pull: { comments: { _id: commentId } } }, // Remove comment regardless of user
    { new: true },
  ).populate('comments.user', 'name email');

  if (!updatedRequest) return next(new AppError('Comment not found', 404));

  return res.status(200).json({
    status: 'success',
    message: 'Comment deleted by admin',
    comments: updatedRequest.comments,
  });
});
