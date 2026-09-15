// Transform Supabase snake_case rows to the camelCase + nested shape the frontend expects

export const transformUser = (row) => {
  if (!row) return null;
  const base = {
    _id: row.id,
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    profileImg: {
      url: row.profile_img_url || 'https://www.gravatar.com/avatar/?d=mp',
      publicId: row.profile_img_path || '',
    },
    termsConditions: row.terms_conditions,
    active: row.active,
    helpRequests: [],
    helpsRendered: [],
    giveaways: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  // Optional verification fields (attached from helper_profiles join)
  if (row.verification_status !== undefined) {
    base.verificationStatus = row.verification_status || 'unverified';
    base.isVerified = row.verification_status === 'verified';
  }
  return base;
};

export const transformRequest = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    user: row._user ? transformUser(row._user) : row.user_id,
    name: row.name,
    category: row.category,
    requestDescription: row.request_description,
    city: row.city,
    state: row.state,
    country: row.country,
    specificDetails: {
      amount: Number(row.amount) || 0,
      deadline: row.deadline || '',
    },
    raised: Number(row._raised) || 0,
    image: {
      url: row.image_url || '',
      publicId: row.image_path || '',
    },
    status: row.status,
    votes: row._votes || [],
    totalVotes: row._voteCount ?? 0,
    comments: row._comments || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const transformGiveaway = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    title: row.title,
    description: row.description,
    image: {
      url: row.image_url || '',
      publicId: row.image_path || '',
    },
    numVotes: row.num_votes || 0,
    category: row.category,
    startDate: row.start_date,
    endDate: row.end_date,
    location: row.location,
    tags: row.tags || [],
    isActive: row.is_active,
    isFeatured: row.is_featured,
    isEnded: row.is_ended,
    isCancelled: row.is_cancelled,
    requirements: Array.isArray(row.requirements)
      ? row.requirements
      : typeof row.requirements === 'string'
        ? [row.requirements]
        : [],
    prizes: row.prizes,
    rules: row.rules,
    isApproved: row.is_approved,
    prizeAmount: Number(row.prize_amount) || 0,
    prizePerWinner: Number(row.prize_per_winner_kobo || 0) / 100 || Number(row.prize_amount) || 0,
    totalPrize: Number(row.total_prize_kobo || 0) / 100 || Number(row.prize_amount) || 0,
    isFunded: row.is_funded ?? true,
    giveawayType: row.giveaway_type || 'free',
    winnerMode: row.winner_mode || 'single',
    maxWinners: row.max_winners || 1,
    createdBy: row.created_by || null,
    escrowId: row.escrow_id || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const transformSubmission = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    giveawayId: row.giveaway_id,
    participantId: row.participant_id,
    proofText: row.proof_text,
    proofUrl: row.proof_url,
    status: row.status,
    reviewNote: row.review_note,
    escrowId: row.escrow_id,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
    participant: row.users
      ? { _id: row.users.id, name: row.users.name, email: row.users.email }
      : undefined,
  };
};

export const transformComment = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    text: row.text,
    user: row.users ? { _id: row.users.id, name: row.users.name, email: row.users.email } : { _id: row.user_id },
    userId: row.user_id,
    createdAt: row.created_at,
  };
};

export const transformHelperProfile = (row, userRow) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    userId: row.user_id,
    bio: row.bio || '',
    skills: row.skills || [],
    criteriaTags: row.criteria_tags || [],
    location: row.location || '',
    verificationStatus: row.verification_status,
    isVerified: row.verification_status === 'verified',
    rating: Number(row.rating) || 0,
    helpsCount: row.helps_count || 0,
    level: row.level,
    leaderboardAnonymous: row.leaderboard_anonymous ?? false,
    user: userRow
      ? {
          _id: userRow.id,
          name: userRow.name,
          email: userRow.email,
          role: userRow.role,
          profileImg: {
            url: userRow.profile_img_url || 'https://www.gravatar.com/avatar/?d=mp',
            publicId: userRow.profile_img_path || '',
          },
        }
      : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const transformVerification = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    idDocumentType: row.id_document_type,
    idDocumentUrl: row.id_document_url,
    note: row.note,
    status: row.status,
    reviewNote: row.review_note,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
    user: row.users
      ? { _id: row.users.id, name: row.users.name, email: row.users.email }
      : undefined,
  };
};

export const transformEscrow = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    reference: row.reference,
    funderId: row.funder_id,
    beneficiaryId: row.beneficiary_id,
    requestId: row.request_id,
    giveawayId: row.giveaway_id,
    purpose: row.purpose,
    amount: Number(row.amount),
    currency: row.currency,
    provider: row.provider || 'paystack',
    amountKobo: Number(row.amount_kobo || Math.round(Number(row.amount || 0) * 100)),
    status: row.status,
    authorizationUrl: row.authorization_url,
    releaseNote: row.release_note,
    message: row.message || null,
    isAnonymous: row.is_anonymous ?? false,
    // Attached by callers that join users!escrow_transactions_funder_id_fkey(id,name)
    funder: row.is_anonymous
      ? null
      : row.users
        ? { _id: row.users.id, name: row.users.name }
        : undefined,
    createdAt: row.created_at,
    heldAt: row.held_at,
    releasedAt: row.released_at,
    refundedAt: row.refunded_at,
  };
};

export const transformDispute = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    escrowId: row.escrow_id,
    raisedBy: row.raised_by,
    reason: row.reason,
    details: row.details,
    status: row.status,
    resolutionNote: row.resolution_note,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
  };
};
