import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import {
  Star,
  HeartHandshake,
  Award,
  MapPin,
  Calendar,
  Sparkles,
  Crown,
  BadgeCheck,
  Gift,
  FileText,
  Trophy,
} from "lucide-react";
import { usePortfolio } from "../../hooks/usePortfolio";
import Spinner from "../../components/Spinner/Spinner";
import NotFound from "../NotFound/NotFound";
import VerifiedBadge from "../../components/VerifiedBadge/VerifiedBadge";
import { userInitials } from "../../utils/userInitials";
import { categoryLabel } from "../../data/helpRequestData";

const ICONS: Record<string, typeof Award> = {
  HeartHandshake, Sparkles, Award, Crown, BadgeCheck, FileText, Gift, Trophy,
};

const tierColor: Record<string, string> = {
  bronze: "bg-amber-100 text-amber-700 ring-amber-600/20",
  silver: "bg-gray-100 text-gray-700 ring-gray-500/20",
  gold: "bg-yellow-100 text-yellow-700 ring-yellow-600/20",
  platinum: "bg-indigo-100 text-indigo-700 ring-indigo-600/20",
};

export default function Portfolio() {
  const { name } = useParams();
  const { data, isLoading, isError } = usePortfolio(name);

  if (isLoading) return <Spinner />;
  if (isError || !data) return <NotFound />;

  const { profile, helpsRendered, awards, requests, joinedAt } = data;
  const u = profile.user;

  return (
    <div className="min-h-screen bg-gray-50 pt-[60px]">
      {/* Hero */}
      <div className="relative overflow-hidden bg-helpMe-950 pb-10 pt-10">
        <div className="absolute inset-0 bg-gradient-to-br from-helpMe-950 via-purple-900/20 to-helpMe-950" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end">
            <div className="h-28 w-28 overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-xl">
              {u?.profileImg?.url ? (
                <img src={u.profileImg.url} alt={u?.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white">
                  {userInitials(u?.name || "")}
                </div>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold text-white">{u?.name}</h1>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <VerifiedBadge status={profile.verificationStatus} size="sm" />
                <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs font-semibold capitalize text-gray-200 ring-1 ring-white/20">
                  {profile.level}
                </span>
              </div>
              {profile.location && (
                <p className="mt-2 flex items-center justify-center gap-1 text-sm text-gray-400 sm:justify-start">
                  <MapPin className="h-4 w-4" /> {profile.location}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-gray-200/60">
            <Star className="mx-auto h-6 w-6 text-yellow-400" />
            <p className="mt-2 text-2xl font-bold text-gray-900">{profile.rating.toFixed(1)}</p>
            <p className="text-xs text-gray-500">Rating</p>
          </div>
          <div className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-gray-200/60">
            <HeartHandshake className="mx-auto h-6 w-6 text-pink-500" />
            <p className="mt-2 text-2xl font-bold text-gray-900">{helpsRendered}</p>
            <p className="text-xs text-gray-500">Helps Rendered</p>
          </div>
          <div className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-gray-200/60">
            <Award className="mx-auto h-6 w-6 text-amber-500" />
            <p className="mt-2 text-2xl font-bold text-gray-900">{awards.length}</p>
            <p className="text-xs text-gray-500">Awards</p>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200/60">
            <h2 className="mb-2 text-lg font-bold text-gray-900">About</h2>
            <p className="text-gray-600">{profile.bio}</p>
          </div>
        )}

        {/* Criteria tags */}
        {profile.criteriaTags?.length > 0 && (
          <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200/60">
            <h2 className="mb-3 text-lg font-bold text-gray-900">Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {profile.criteriaTags.map((t) => (
                <span key={t} className="rounded-full bg-helpMe-950 px-3 py-1 text-xs font-semibold capitalize text-white">
                  {t.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Awards */}
        {awards.length > 0 && (
          <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200/60">
            <h2 className="mb-3 text-lg font-bold text-gray-900">Awards & Recognition</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {awards.map((a) => {
                const Icon = ICONS[a.icon] || Award;
                return (
                  <div key={a.slug} className={`flex items-center gap-3 rounded-xl p-3 ring-1 ring-inset ${tierColor[a.tier] || tierColor.bronze}`}>
                    <Icon className="h-6 w-6 shrink-0" />
                    <div>
                      <p className="text-sm font-bold">{a.name}</p>
                      <p className="text-xs opacity-80">{a.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Requests */}
        {requests.length > 0 && (
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200/60">
            <h2 className="mb-3 text-lg font-bold text-gray-900">Help Requests</h2>
            <div className="space-y-2">
              {requests.map((r) => (
                <Link
                  key={r._id}
                  to={`/requests/${r._id}`}
                  className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 transition hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{r.name}</p>
                    <p className="text-xs text-gray-500">{categoryLabel(r.category)}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                    r.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {r.status}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <p className="mt-6 flex items-center justify-center gap-1 text-xs text-gray-400">
          <Calendar className="h-3.5 w-3.5" />
          Joined {joinedAt ? format(new Date(joinedAt), "MMMM yyyy") : ""}
        </p>
      </div>
    </div>
  );
}
