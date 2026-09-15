import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LoaderCircle,
  Save,
  Award,
  Star,
  HeartHandshake,
  BadgeCheck,
  Upload,
  FileText,
  EyeOff,
} from "lucide-react";
import {
  useHelperProfile,
  useHelperTags,
  useMyVerification,
} from "../../hooks/useHelperProfile";
import VerifiedBadge from "../VerifiedBadge/VerifiedBadge";

const ID_TYPES = [
  { value: "national_id", label: "National ID" },
  { value: "passport", label: "Passport" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "voters_card", label: "Voter's Card" },
];

export default function HelperSettings() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useHelperProfile();
  const { data: tags } = useHelperTags();
  const { data: verification } = useMyVerification();

  const [form, setForm] = useState({
    bio: "",
    skills: "",
    criteriaTags: [] as string[],
    location: "",
    leaderboardAnonymous: false,
  });

  const [verifForm, setVerifForm] = useState({
    fullName: "",
    idDocumentType: "national_id",
  });
  const [idFile, setIdFile] = useState<File | null>(null);

  useEffect(() => {
    if (profile) {
      setForm({
        bio: profile.bio || "",
        skills: (profile.skills || []).join(", "),
        criteriaTags: profile.criteriaTags || [],
        location: profile.location || "",
        leaderboardAnonymous: profile.leaderboardAnonymous ?? false,
      });
    }
  }, [profile]);

  // Save profile
  const { mutate: saveProfile, isLoading: saving } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/helpers/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          bio: form.bio,
          skills: form.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          criteriaTags: form.criteriaTags,
          location: form.location,
          leaderboardAnonymous: form.leaderboardAnonymous,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Save failed");
      return data;
    },
    onSuccess: () => {
      toast.success("Helper profile saved");
      queryClient.invalidateQueries({ queryKey: ["helperProfile"] });
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  // Submit verification
  const { mutate: submitVerification, isLoading: submitting } = useMutation({
    mutationFn: async () => {
      let idDocumentUrl: string | undefined;
      let idDocumentPath: string | undefined;

      if (idFile) {
        const fd = new FormData();
        fd.append("image", idFile);
        fd.append("type", "verification");
        const up = await fetch("/api/v1/upload", {
          method: "POST",
          body: fd,
          credentials: "include",
        });
        const upData = await up.json();
        if (!up.ok) throw new Error(upData.message || "Document upload failed");
        idDocumentUrl = upData.data.url;
        idDocumentPath = upData.data.publicId;
      }

      const res = await fetch("/api/v1/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: verifForm.fullName,
          idDocumentType: verifForm.idDocumentType,
          idDocumentUrl,
          idDocumentPath,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Submission failed");
      return data;
    },
    onSuccess: () => {
      toast.success("Verification submitted for review");
      queryClient.invalidateQueries({ queryKey: ["myVerification"] });
      queryClient.invalidateQueries({ queryKey: ["helperProfile"] });
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Submission failed"),
  });

  const toggleTag = (slug: string) => {
    setForm((f) => ({
      ...f,
      criteriaTags: f.criteriaTags.includes(slug)
        ? f.criteriaTags.filter((t) => t !== slug)
        : [...f.criteriaTags, slug],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoaderCircle className="h-6 w-6 animate-spin text-helpMe-500" />
      </div>
    );
  }

  const status = profile?.verificationStatus || "unverified";
  const canSubmitVerification = status === "unverified" || status === "rejected";

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Status + stats hero */}
      <div className="rounded-2xl bg-gradient-to-br from-helpMe-950 to-purple-900 p-5 text-white shadow-lg sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold">Member Status</h3>
            <div className="mt-2">
              <VerifiedBadge status={status} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:flex sm:gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                <Star className="h-5 w-5 text-yellow-400" />
                {profile?.rating?.toFixed(1) ?? "0.0"}
              </div>
              <p className="text-xs text-gray-300">Rating</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                <HeartHandshake className="h-5 w-5 text-pink-400" />
                {profile?.helpsCount ?? 0}
              </div>
              <p className="text-xs text-gray-300">Helps</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold capitalize">
                <Award className="h-5 w-5 text-amber-400" />
                {profile?.level ?? "novice"}
              </div>
              <p className="text-xs text-gray-300">Level</p>
            </div>
          </div>

        </div>
      </div>

      {/* Profile editor */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200/60 sm:p-8">
        <h3 className="mb-1 text-lg font-bold text-gray-900">Profile &amp; Expertise</h3>
        <p className="mb-6 text-sm text-gray-500">
          Tell the community about yourself and the kind of help you can offer.
        </p>

        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Bio</label>
            <textarea
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-helpMe-500 focus:bg-white focus:ring-2 focus:ring-helpMe-500/20"
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="I'm a nurse with 5 years experience helping communities..."
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Skills (comma separated)
              </label>
              <input
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-helpMe-500 focus:bg-white focus:ring-2 focus:ring-helpMe-500/20"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                placeholder="First Aid, Tutoring, Logistics"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Location</label>
              <input
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-helpMe-500 focus:bg-white focus:ring-2 focus:ring-helpMe-500/20"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Lagos, Nigeria"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Criteria Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {(tags || []).map((tag) => {
                const active = form.criteriaTags.includes(tag.slug);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.slug)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? "bg-helpMe-950 text-white shadow"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-purple-100 bg-helpMe-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-white p-2 text-helpMe-700 shadow-sm"><EyeOff className="h-5 w-5" /></div>
              <div>
                <p className="text-sm font-bold text-gray-900">Appear anonymously on the Giver-board</p>
                <p className="mt-1 max-w-xl text-xs leading-5 text-gray-500">Your verified impact and points will still count, but your name, photo, location, badge, and profile link will be hidden.</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.leaderboardAnonymous}
              onClick={() => setForm({ ...form, leaderboardAnonymous: !form.leaderboardAnonymous })}
              className={`relative h-7 w-12 shrink-0 rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-helpMe-500 ${form.leaderboardAnonymous ? "bg-helpMe-800" : "bg-gray-300"}`}
              aria-label="Appear anonymously on the Giver-board"
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.leaderboardAnonymous ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>

        <button
          onClick={() => saveProfile()}
          disabled={saving}
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-helpMe-950 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-helpMe-800 disabled:opacity-50 sm:w-auto"
        >
          {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Profile
        </button>
      </div>

      {/* Verification */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200/60 sm:p-8">
        <div className="mb-1 flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-bold text-gray-900">Get Verified</h3>
        </div>
        <p className="mb-6 text-sm text-gray-500">
          Verified members earn trust and can create monetary giveaways backed by
          escrow. Upload a valid ID for review.
        </p>

        {status === "verified" ? (
          <div className="rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700 ring-1 ring-emerald-600/20">
            🎉 You're a verified member. The community can trust your profile.
          </div>
        ) : status === "pending" ? (
          <div className="rounded-xl bg-amber-50 p-4 text-sm font-medium text-amber-700 ring-1 ring-amber-600/20">
            Your verification is under review. We'll notify you once it's processed.
          </div>
        ) : (
          <div className="space-y-5">
            {status === "rejected" && verification?.reviewNote && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-600/20">
                Previous request rejected: {verification.reviewNote}
              </div>
            )}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Full Legal Name
                </label>
                <input
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-helpMe-500 focus:bg-white focus:ring-2 focus:ring-helpMe-500/20"
                  value={verifForm.fullName}
                  onChange={(e) => setVerifForm({ ...verifForm, fullName: e.target.value })}
                  placeholder="As shown on your ID"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  ID Document Type
                </label>
                <select
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-helpMe-500 focus:bg-white focus:ring-2 focus:ring-helpMe-500/20"
                  value={verifForm.idDocumentType}
                  onChange={(e) => setVerifForm({ ...verifForm, idDocumentType: e.target.value })}
                >
                  {ID_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Upload ID Document
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-4 transition hover:border-helpMe-500 hover:bg-white">
                {idFile ? (
                  <>
                    <FileText className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm text-gray-700">{idFile.name}</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-500">Click to upload (image or PDF)</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  hidden
                  onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <button
              onClick={() => submitVerification()}
              disabled={submitting || !verifForm.fullName || !canSubmitVerification}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {submitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <BadgeCheck className="h-4 w-4" />
              )}
              Submit for Verification
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
