import { useState } from "react";
import toast from "react-hot-toast";
import { ShieldAlert, X, LoaderCircle } from "lucide-react";

interface Props {
  requestId?: string;
  counterpartyId?: string;
  onClose: () => void;
  onAccepted?: () => void;
}

export default function MeetingSafetyModal({ requestId, counterpartyId, onClose, onAccepted }: Props) {
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);

  const accept = async () => {
    setSaving(true);
    try {
      await fetch("/api/v1/requests/meeting-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ requestId, counterpartyId }),
      });
      toast.success("Safety acknowledgement recorded");
      onAccepted?.();
      onClose();
    } catch {
      toast.error("Could not record acknowledgement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
              <ShieldAlert className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Safety First</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 text-sm text-gray-600">
          <p>
            For your safety, any help that requires meeting in person <strong>must happen in a
            public place</strong> (e.g. a bank, mall, or busy public space).
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Never share sensitive personal or financial details.</li>
            <li>Tell a friend or family member where you're going.</li>
            <li>Prefer using the platform's escrow for any money.</li>
          </ul>
          <p className="rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
            HelpMe is not liable for meetings held in private or unsafe locations.
          </p>
        </div>

        <label className="mt-4 flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300"
          />
          I understand and agree to meet only in public places.
        </label>

        <button
          onClick={accept}
          disabled={!checked || saving}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-helpMe-950 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-helpMe-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
          I Understand & Agree
        </button>
      </div>
    </div>
  );
}
