import toast from "react-hot-toast";
import { Loader, LoaderPinwheel, Upload, CheckCircle } from "lucide-react";
import ShortHeader from "../ShortHeader/ShortHeader";
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

export default function RequestForm() {
  const [requestData, setRequestData] = useState(initialData);
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [imageIsUploaded, setImageIsUploaded] = useState(null);
  const requestImgRef = useRef(null);
  const queryClient = useQueryClient();
  const { createRequest: createRequestStore } = useRequestStore();

  const { data: user } = useQuery({ queryKey: ["authUser"] });

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
      toast.success("Request created successfully");
      setRequestData(initialData);
      setFileName("");
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

  async function handleRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    if (requestData.image) {
      try {
        console.log("Tyring to upload image to cloudinary now");
        console.log("BEFORE UPLOAD: ", requestData.image);
        const uploadedImage = await handleImageUpload(requestData.image);

        if (!uploadedImage) {
          toast.error("Image upload failed, try again");
          return;
        }
        const requestDataToSave = { ...requestData, image: uploadedImage };
        setImageIsUploaded(uploadedImage);

        console.log(uploadedImage);
        console.log(imageIsUploaded);
        console.log(requestDataToSave);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="pt-12">
          <ShortHeader heading="Make Your Request" />
          <p className="mt-2 text-sm text-gray-600">
            Please fill in the form below to make your request.
          </p>
        </div>

        <form
          onSubmit={handleRequest}
          className="mt-8 space-y-8 rounded-xl bg-white p-8 shadow-xl ring-1 ring-gray-200"
        >
          {/* Personal Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Personal Information
            </h3>
            <div>
              <label
                htmlFor="user"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                type="text"
                id="user"
                value={user?.name}
                onChange={(e) =>
                  setRequestData({ ...requestData, name: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
                placeholder="Enter your full name"
                required
                disabled
              />
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Basic Information
            </h3>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                What kind of help do you need?
              </label>
              <select
                id="category"
                value={requestData.category}
                onChange={(e) =>
                  setRequestData({ ...requestData, category: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name.toLowerCase()}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="requestBody"
                className="block text-sm font-medium text-gray-700"
              >
                Briefly describe your situation
              </label>
              <textarea
                id="requestBody"
                value={requestData.requestDescription}
                onChange={(e) =>
                  setRequestData({
                    ...requestData,
                    requestDescription: e.target.value,
                  })
                }
                rows={4}
                className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
                placeholder="Describe your situation in detail..."
                required
              />
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Location Information
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700"
                >
                  State
                </label>
                <select
                  id="state"
                  value={requestData.state}
                  onChange={(e) =>
                    setRequestData({ ...requestData, state: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
                  required
                >
                  <option value="">Select State</option>
                  {nigeriaStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700"
                >
                  City
                </label>
                <select
                  id="city"
                  value={requestData.city}
                  onChange={(e) =>
                    setRequestData({ ...requestData, city: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 disabled:bg-gray-100 disabled:text-gray-500 sm:text-sm"
                  required
                  disabled={!requestData.state}
                >
                  <option value="">Select City</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Specific Details */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Specific Details
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700"
                >
                  How much money do you need?
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="text-gray-500 sm:text-sm">₦</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    value={requestData.specificDetails.amount || ""}
                    onChange={(e) =>
                      setRequestData({
                        ...requestData,
                        specificDetails: {
                          ...requestData.specificDetails,
                          amount: +e.target.value,
                        },
                      })
                    }
                    className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 py-3 pl-8 pr-4 text-gray-900 shadow-sm outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="deadline"
                  className="block text-sm font-medium text-gray-700"
                >
                  When do you need it?
                </label>
                <input
                  type="date"
                  id="deadline"
                  value={requestData.specificDetails.deadline}
                  onChange={(e) =>
                    setRequestData({
                      ...requestData,
                      specificDetails: {
                        ...requestData.specificDetails,
                        deadline: e.target.value,
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {fileName ? "Uploading Image" : "Upload Image"}
                </label>
                <div className="mt-1">
                  <label
                    htmlFor="requestImage"
                    className="inline-flex cursor-pointer items-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {!fileName && <Upload className="mr-2 h-4 w-4" />}
                    {fileName && <CheckCircle className="mr-2 h-4 w-4" />}

                    {fileName && `Selected: ${fileName}`}
                    {!fileName && "Choose File"}
                  </label>
                  <input
                    ref={requestImgRef}
                    type="file"
                    id="requestImage"
                    accept="image/jpeg, image/png"
                    onChange={handleImage}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => {
                setRequestData(initialData);
                setFileName("");
                setAvailableCities([]);
              }}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isLoading || isSubmitting || !fileName}
              className="inline-flex items-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading || isSubmitting ? (
                <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
