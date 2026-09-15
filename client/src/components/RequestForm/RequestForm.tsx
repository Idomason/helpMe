import toast from "react-hot-toast";
import {
  LoaderPinwheel,
  Upload,
  CheckCircle,
  User,
  Tag,
  FileText,
  MapPin,
  Coins,
  Calendar,
  ImageIcon,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRequestImage } from "../../hooks/useRequestImage";
import { nigeriaStates, nigeriaCities } from "../../data/nigeriaData";
import { categories } from "../../data/helpRequestData";
import { useRequestStore, HelpRequest } from "../../store";

type SpecificDetailsProp = {
  amount: number;
  deadline: string;
};

type RequestPropData = {
  name: string;
  category: string;
  requestDescription: string;
  city: string;
  state: string;
  country: string;
  specificDetails: SpecificDetailsProp;
  image: { url: string; public_id: string } | null;
  status?: string;
};

const initialData: RequestPropData = {
  name: "",
  category: "",
  requestDescription: "",
  city: "",
  state: "",
  country: "Nigeria",
  specificDetails: {
    amount: 0,
    deadline: "",
  },
  image: null,
  status: "pending",
};

interface RequestFormProps {
  onSuccess?: () => void;
  inModal?: boolean;
}

export default function RequestForm({ onSuccess, inModal }: RequestFormProps = {}) {
  const [requestData, setRequestData] = useState<RequestPropData>(initialData);
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const requestImgRef = useRef(null);
  const queryClient = useQueryClient();
  const { createRequest: createRequestStore } = useRequestStore();

  const { data: user } = useQuery<{ name: string }>({ queryKey: ["authUser"] });

  // Cloudinary image upload hook
  const { handleImageUpload } = useRequestImage();

  // Save request to db
  const { mutate: createRequestMutation, isLoading } = useMutation({
    mutationFn: async (newRequest: RequestPropData) => {
      const response = await createRequestStore(newRequest as HelpRequest);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-my-requests"] });
      queryClient.invalidateQueries({ queryKey: ["latest-requests"] });
      toast.success("Request created successfully");
      setRequestData(initialData);
      setFileName("");
      onSuccess?.();
    },
    onError: (error: { message: string }) => {
      toast.error(error.message || "Failed to create request");
    },
  });

  // Update available cities when state changes
  useEffect(() => {
    if (requestData.state) {
      setAvailableCities(nigeriaCities[requestData.state] || []);
      setRequestData((prev) => ({ ...prev, city: "" })); // Reset city when state changes
    } else {
      setAvailableCities([]);
    }
  }, [requestData.state]);

  // Add this after your existing useEffect
  useEffect(() => {
    if (user?.name) {
      setRequestData((prev) => ({ ...prev, name: user.name }));
    }
  }, [user?.name]);

  async function handleRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    if (requestData.image) {
      try {
        console.log("Tyring to upload image to cloudinary now");
        console.log("BEFORE UPLOAD: ", requestData.image);

        const uploadedImage = await handleImageUpload(requestData.image);
        console.log("AFTER UPLOAD: ", uploadedImage);

        if (!uploadedImage) {
          toast.error("Image upload failed, try again");
          return;
        }
        const requestDataToSave = { ...requestData, image: uploadedImage };

        console.log("DATA TO SAVE AFTER IMAGE UPLOAD", requestDataToSave);

        createRequestMutation(requestDataToSave);
      } catch (error: any) {
        toast.error(error.message || "Image upload failed");
      }
    } else {
      createRequestMutation(requestData);
    }
    setIsSubmitting(false);
  }

  function handleImage(event: any) {
    let file = event.target.files[0];

    if (file && file.type.startsWith("image/")) {
      setFileName(file.name);

      setRequestData({
        ...requestData,
        image: { url: URL.createObjectURL(file), public_id: "" },
      });

      file = null;
    } else {
      return toast.error("Please select a valid image file");
    }
  }

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-helpMe-500 focus:bg-white focus:ring-2 focus:ring-helpMe-500/20 disabled:bg-gray-100 disabled:text-gray-500";
  const labelCls =
    "mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-gray-700";
  // Section wrapper: full card standalone, lighter divider inside a modal
  const sectionCls = inModal
    ? "border-t border-gray-100 pt-6 first:border-t-0 first:pt-0"
    : "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200/60 sm:p-8";

  return (
    <div className={inModal ? "" : "mx-auto max-w-4xl"}>
      <form
        onSubmit={handleRequest}
        className={
          inModal
            ? "h-[calc(100dvh-4rem-env(safe-area-inset-top))] space-y-5 overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:h-auto sm:max-h-[75vh] sm:space-y-6 sm:p-8"
            : "space-y-5"
        }
      >
        {/* Personal + Basic */}
        <div className={sectionCls}>
          <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-gray-900">
            <User className="h-4 w-4 text-helpMe-600" /> Personal &amp; Basic Info
          </h3>

          <div className="space-y-5">
            <div>
              <label htmlFor="user" className={labelCls}>Full Name</label>
              <input
                type="text"
                id="user"
                value={user?.name || ""}
                className={inputCls}
                placeholder="Enter your full name"
                required
                disabled
              />
            </div>

            <div>
              <label htmlFor="category" className={labelCls}>
                <Tag className="h-4 w-4 text-gray-400" /> What kind of help do you need?
              </label>
              <select
                id="category"
                value={requestData.category}
                onChange={(e) => setRequestData({ ...requestData, category: e.target.value })}
                className={inputCls}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="requestBody" className={labelCls}>
                <FileText className="h-4 w-4 text-gray-400" /> Briefly describe your situation
              </label>
              <textarea
                id="requestBody"
                value={requestData.requestDescription}
                onChange={(e) => setRequestData({ ...requestData, requestDescription: e.target.value })}
                rows={4}
                className={inputCls}
                placeholder="Describe your situation in detail..."
                required
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className={sectionCls}>
          <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-gray-900">
            <MapPin className="h-4 w-4 text-helpMe-600" /> Location
          </h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="state" className={labelCls}>State</label>
              <select
                id="state"
                value={requestData.state}
                onChange={(e) => setRequestData({ ...requestData, state: e.target.value })}
                className={inputCls}
                required
              >
                <option value="">Select State</option>
                {nigeriaStates.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="city" className={labelCls}>City</label>
              <select
                id="city"
                value={requestData.city}
                onChange={(e) => setRequestData({ ...requestData, city: e.target.value })}
                className={inputCls}
                required
                disabled={!requestData.state}
              >
                <option value="">Select City</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Specific Details */}
        <div className={sectionCls}>
          <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-gray-900">
            <Coins className="h-4 w-4 text-helpMe-600" /> Specific Details
          </h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="amount" className={labelCls}>
                <Coins className="h-4 w-4 text-gray-400" /> How much do you need?
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">₦</span>
                <input
                  type="number"
                  id="amount"
                  value={requestData.specificDetails.amount || ""}
                  onChange={(e) => setRequestData({ ...requestData, specificDetails: { ...requestData.specificDetails, amount: +e.target.value } })}
                  className={`${inputCls} pl-8`}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="deadline" className={labelCls}>
                <Calendar className="h-4 w-4 text-gray-400" /> When do you need it?
              </label>
              <input
                type="date"
                id="deadline"
                value={requestData.specificDetails.deadline}
                onChange={(e) => setRequestData({ ...requestData, specificDetails: { ...requestData.specificDetails, deadline: e.target.value } })}
                className={inputCls}
                required
              />
            </div>
          </div>

          {/* Image upload dropzone */}
          <div className="mt-5">
            <label className={labelCls}>
              <ImageIcon className="h-4 w-4 text-gray-400" /> Request Image
            </label>
            <label
              htmlFor="requestImage"
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
                fileName
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-gray-300 bg-gray-50 hover:border-helpMe-400 hover:bg-white"
              }`}
            >
              {fileName ? (
                <>
                  <CheckCircle className="h-7 w-7 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">{fileName}</span>
                  <span className="text-xs text-gray-500">Click to change</span>
                </>
              ) : (
                <>
                  <Upload className="h-7 w-7 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Click to upload an image</span>
                  <span className="text-xs text-gray-400">JPG or PNG</span>
                </>
              )}
              <input
                ref={requestImgRef}
                type="file"
                id="requestImage"
                accept="image/jpeg, image/png"
                onChange={handleImage}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 -mx-4 flex flex-col-reverse gap-2 border-t border-gray-100 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:static sm:mx-0 sm:flex-row sm:justify-end sm:border-0 sm:bg-transparent sm:p-0">
          <button
            type="button"
            onClick={() => {
              setRequestData(initialData);
              setFileName("");
              setAvailableCities([]);
            }}
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isLoading || isSubmitting || !fileName}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-helpMe-950 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-helpMe-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {(isLoading || isSubmitting) && <LoaderPinwheel className="h-4 w-4 animate-spin" />}
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
}
