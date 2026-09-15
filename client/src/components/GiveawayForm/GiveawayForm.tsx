import { Children, isValidElement, useMemo, useRef, useState } from "react";
import { CalendarDays, ImagePlus, MapPin, Trophy, Users, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { categories } from "../../data/helpRequestData";
import { useGiveawayImage } from "../../hooks/useGiveawayImage";
import { useGiveaway } from "../../hooks/useGiveaway";
import { Giveaway } from "../../store";

type FormData = {
  title: string; description: string; image: File | null;
  prizeAmount: string; requirements: string; category: string; tags: string;
  location: string; startDate: string; endDate: string;
  winnerMode: "single" | "multiple"; maxWinners: string;
};

interface Props { onSuccess?: () => void; inModal?: boolean; isVerified?: boolean }

const initialData: FormData = {
  title: "", description: "", image: null, prizeAmount: "",
  requirements: "", category: "", tags: "", location: "", startDate: "",
  endDate: "", winnerMode: "single", maxWinners: "1",
};
const inputClass = "h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-helpMe-500 focus:ring-2 focus:ring-helpMe-500/15";
const labelClass = "mb-1.5 block text-xs font-semibold text-gray-700";

export default function GiveawayForm({ onSuccess, inModal, isVerified }: Props = {}) {
  const [data, setData] = useState<FormData>(initialData);
  const [previewUrl, setPreviewUrl] = useState("");
  const imageInput = useRef<HTMLInputElement>(null);
  const { handleImageUpload } = useGiveawayImage();
  const { createGiveawayAsync, isLoading } = useGiveaway();
  const requirements = useMemo(
    () => data.requirements.split("\n").map((item) => item.trim()).filter(Boolean),
    [data.requirements],
  );

  const change = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setData((current) => ({
      ...current,
      [name]: value,
      ...(name === "winnerMode"
        ? { maxWinners: value === "multiple" ? "2" : "1" }
        : {}),
    }));
  };

  const selectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file && file.size > 2 * 1024 * 1024) {
      event.target.value = "";
      toast.error("Choose an image smaller than 2 MB");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setData((current) => ({ ...current, image: file }));
    setPreviewUrl(file ? URL.createObjectURL(file) : "");
  };

  const clearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setData((current) => ({ ...current, image: null }));
    setPreviewUrl("");
    if (imageInput.current) imageInput.current.value = "";
  };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;
    if (!data.title.trim()) return toast.error("Add a giveaway title");
    if (!data.description.trim()) return toast.error("Tell people what the giveaway is about");
    if (!data.category) return toast.error("Choose a category");
    if (!data.image) return toast.error("Add a cover image");
    if (!data.startDate || !data.endDate) return toast.error("Set the giveaway dates");
    if (new Date(data.endDate) < new Date(data.startDate)) return toast.error("End date must be after the start date");
    if (!requirements.length) return toast.error("Add at least one entry requirement");
    if (!isVerified) return toast.error("Complete verification before creating a financial giveaway");
    if (Number(data.prizeAmount) <= 0) return toast.error("Enter the cash prize per winner");

    try {
      const image = await handleImageUpload(data.image);
      if (!image) return toast.error("The image could not be uploaded");
      const giveaway: Giveaway = {
        _id: "", title: data.title.trim(), description: data.description.trim(),
        image: { url: image.url, publicId: image.publicId }, numVotes: 0,
        category: data.category, startDate: data.startDate, endDate: data.endDate,
        location: data.location.trim(), tags: data.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        isActive: true, isFeatured: false, isEnded: false, requirements,
        prizes: `₦${Number(data.prizeAmount).toLocaleString()} per winner`, giveawayDescription: data.description.trim(),
        createdAt: new Date().toISOString(), prizeAmount: Number(data.prizeAmount) || 0,
        prizePerWinner: Number(data.prizeAmount) || 0,
        winnerMode: Number(data.maxWinners) > 1 ? "multiple" : "single",
        maxWinners: Math.max(1, Number(data.maxWinners) || 1),
      };
      const result = await createGiveawayAsync(giveaway);
      if (result?.success) {
        clearImage(); setData(initialData); onSuccess?.();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Giveaway could not be created");
    }
  }

  return (
    <form className={inModal ? "flex h-[calc(100dvh-4.5rem-env(safe-area-inset-top))] flex-col sm:h-auto sm:max-h-[calc(90vh-84px)]" : "mx-auto max-w-3xl overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200"} onSubmit={submit}>
      <div className="grid flex-1 gap-x-5 gap-y-4 overflow-y-auto overscroll-contain bg-gray-50/70 p-4 sm:grid-cols-2 sm:p-6">
        {!inModal && <div className="sm:col-span-2"><h2 className="text-xl font-bold text-gray-900">Create a giveaway</h2><p className="mt-1 text-sm text-gray-500">Set the entry details and reward in one place.</p></div>}
        <Field wide label="Giveaway title" required><input className={inputClass} id="title" name="title" value={data.title} onChange={change} placeholder="e.g. Back-to-school laptop giveaway" maxLength={100} autoFocus={inModal} /></Field>
        <Field wide label="About this giveaway" required><textarea className={`${inputClass} h-20 resize-none py-3`} id="description" name="description" value={data.description} onChange={change} placeholder="Explain who this is for and why you're creating it" maxLength={1000} /><p className="mt-1 text-right text-[10px] text-gray-400">{data.description.length}/1000</p></Field>
        <Field label="Category" required><select className={inputClass} id="category" name="category" value={data.category} onChange={change}><option value="">Choose a category</option>{categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}</select></Field>
        <Field label={<><MapPin className="mr-1 inline h-3.5 w-3.5" />Location</>}><input className={inputClass} id="location" name="location" value={data.location} onChange={change} placeholder="City, State" /></Field>
        <Field label={<><CalendarDays className="mr-1 inline h-3.5 w-3.5" />Starts</>} required><input className={inputClass} type="date" id="startDate" name="startDate" value={data.startDate} onChange={change} /></Field>
        <Field label={<><CalendarDays className="mr-1 inline h-3.5 w-3.5" />Ends</>} required><input className={inputClass} type="date" id="endDate" name="endDate" min={data.startDate || undefined} value={data.endDate} onChange={change} /></Field>
        <Field wide label="Entry requirements" required><textarea className={`${inputClass} h-20 resize-none py-3`} id="requirements" name="requirements" value={data.requirements} onChange={change} placeholder={"Write one requirement per line\nExample: Must be enrolled in a Nigerian school"} /><p className="mt-1 text-[10px] text-gray-500">Each line becomes a checklist item. This replaces the separate Rules field.</p></Field>

        <div className="rounded-xl border border-purple-100 bg-white p-4 sm:col-span-2">
          <div className="mb-3 flex items-center gap-2"><Trophy className="h-4 w-4 text-helpMe-700" /><p className="text-xs font-bold text-gray-900">Financial reward</p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prize per winner (₦)" required><input className={`${inputClass} disabled:cursor-not-allowed disabled:bg-gray-100`} type="number" min={100} id="prizeAmount" name="prizeAmount" disabled={!isVerified} value={data.prizeAmount} onChange={change} placeholder="10,000" /></Field>
            <Field label={<><Users className="mr-1 inline h-3.5 w-3.5" />Number of winners</>} required><input className={inputClass} type="number" min={1} max={100} id="maxWinners" name="maxWinners" value={data.maxWinners} onChange={change} /></Field>
            <div className="rounded-lg bg-purple-50 px-3 py-2 text-sm sm:col-span-2"><span className="text-gray-600">Total purse secured from wallet</span><strong className="float-right text-helpMe-900">₦{((Number(data.prizeAmount) || 0) * (Number(data.maxWinners) || 1)).toLocaleString()}</strong></div>
            {!isVerified && <p className="text-[10px] font-medium text-amber-600 sm:col-span-2">Complete profile verification to create and fund a financial giveaway.</p>}
          </div>
        </div>

        <Field wide label="Cover image" required>
          <label className="group relative flex h-24 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-white transition hover:border-helpMe-400 hover:bg-purple-50/40">
            {previewUrl ? <><img src={previewUrl} alt="Giveaway preview" className="h-full w-full object-cover" /><button type="button" onClick={(event) => { event.preventDefault(); clearImage(); }} className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-gray-600 shadow" aria-label="Remove image"><X className="h-4 w-4" /></button></> : <div className="flex items-center gap-3 text-left"><span className="rounded-lg bg-purple-50 p-2.5 text-helpMe-700"><ImagePlus className="h-5 w-5" /></span><span><strong className="block text-xs text-gray-700">Choose a cover image</strong><small className="text-[10px] text-gray-400">JPG or PNG, up to 2 MB</small></span></div>}
            <input ref={imageInput} type="file" id="image" name="image" accept="image/jpeg,image/png" onChange={selectImage} className="sr-only" />
          </label>
        </Field>
        <Field wide label={<>Search tags <span className="font-normal text-gray-400">Optional</span></>}><input className={inputClass} id="tags" name="tags" value={data.tags} onChange={change} placeholder="education, students, technology" /></Field>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:py-4"><p className="hidden text-[11px] text-gray-500 sm:block"><span className="text-pink-600">*</span> Required fields</p><button className="ml-auto inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-helpMe-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-helpMe-800 disabled:cursor-wait disabled:opacity-60 sm:w-auto sm:min-w-36" type="submit" disabled={isLoading}>{isLoading ? "Creating…" : "Create giveaway"}</button></div>
    </form>
  );
}

function Field({ label, required, wide, children }: { label: React.ReactNode; required?: boolean; wide?: boolean; children: React.ReactNode }) {
  const control = Children.toArray(children).find(isValidElement);
  const htmlFor = isValidElement<{ id?: string }>(control) ? control.props.id : undefined;
  return <div className={wide ? "sm:col-span-2" : ""}><label className={labelClass} htmlFor={htmlFor}>{label} {required && <span className="text-pink-600">*</span>}</label>{children}</div>;
}
