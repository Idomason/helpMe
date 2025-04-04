import { useState, useRef } from "react";
import { useGiveawayImage } from "../../hooks/useGiveawayImage";
import { useMutation } from "@tanstack/react-query";
import { useGiveawayStore, Giveaway } from "../../store";
import { toast } from "react-hot-toast";

type GiveawayPropData = {
  title: string;
  description: string;
  image: File | null;
  prizes: string;
  rules: string;
  requirements: string;
  category: string;
  tags: string;
  location: string;
  startDate: string;
  endDate: string;
};

export default function GiveawayForm() {
  const [giveawayData, setGiveawayData] = useState<GiveawayPropData>({
    title: "",
    description: "",
    image: null,
    prizes: "",
    rules: "",
    requirements: "",
    category: "",
    tags: "",
    location: "",
    startDate: "",
    endDate: "",
  });
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const giveawayImgRef = useRef(null);
  const { createGiveaway } = useGiveawayStore();

  // Cloudinary image upload hook
  const { handleImageUpload } = useGiveawayImage();

  // Save giveaway to db
  const { mutate: createGiveawayMutation, isLoading } = useMutation({
    mutationFn: async (newGiveaway: GiveawayPropData) => {
      const response = await createGiveaway(newGiveaway as Giveaway);
      return response;
    },
    onSuccess: () => {
      toast.success("Giveaway created successfully");
      setGiveawayData({
        title: "",
        description: "",
        image: null,
        prizes: "",
        rules: "",
        requirements: "",
        category: "",
        tags: "",
        location: "",
        startDate: "",
        endDate: "",
      });
      setFileName("");
    },
    onError: (error: { message: string }) => {
      toast.error(error.message || "Failed to create giveaway");
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setGiveawayData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setGiveawayData((prev) => ({
      ...prev,
      image: file,
    }));

    // Create preview URL for the selected image
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileName(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFileName("");
    }
  };

  const resetForm = () => {
    setGiveawayData({
      title: "",
      description: "",
      image: null,
      prizes: "",
      rules: "",
      requirements: "",
      category: "",
      tags: "",
      location: "",
      startDate: "",
      endDate: "",
    });
    setFileName("");
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const image = giveawayData.image;
    const imageUrl = await handleImageUpload(image);

    const newGiveaway = {
      ...giveawayData,
      image: imageUrl,
    };

    createGiveawayMutation(newGiveaway);
  }

  return (
    <div className="mt-16 flex items-center justify-center bg-helpMe-900 px-4 py-16">
      <div className="w-full max-w-3xl">
        <form
          className="flex flex-col gap-6 rounded-lg bg-white p-8 shadow-md"
          onSubmit={handleSubmit}
        >
          <h2 className="mb-2 text-center text-2xl font-bold text-helpMe-700">
            Create a Giveaway
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Title Field */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="title"
              >
                Title
              </label>
              <input
                className="rounded-md border border-gray-300 p-2 shadow-sm focus:border-helpMe-500 focus:outline-none focus:ring-1 focus:ring-helpMe-500"
                type="text"
                id="title"
                name="title"
                value={giveawayData.title}
                onChange={handleInputChange}
                placeholder="Enter giveaway title"
              />
            </div>

            {/* Location Field */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="location"
              >
                Location
              </label>
              <input
                className="rounded-md border border-gray-300 p-2 shadow-sm focus:border-helpMe-500 focus:outline-none focus:ring-1 focus:ring-helpMe-500"
                type="text"
                id="location"
                name="location"
                value={giveawayData.location}
                onChange={handleInputChange}
                placeholder="City, Country"
              />
            </div>

            {/* Start Date Field */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="startDate"
              >
                Start Date
              </label>
              <input
                className="rounded-md border border-gray-300 p-2 shadow-sm focus:border-helpMe-500 focus:outline-none focus:ring-1 focus:ring-helpMe-500"
                type="date"
                id="startDate"
                name="startDate"
                value={giveawayData.startDate}
                onChange={handleInputChange}
              />
            </div>

            {/* End Date Field */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="endDate"
              >
                End Date
              </label>
              <input
                className="rounded-md border border-gray-300 p-2 shadow-sm focus:border-helpMe-500 focus:outline-none focus:ring-1 focus:ring-helpMe-500"
                type="date"
                id="endDate"
                name="endDate"
                value={giveawayData.endDate}
                onChange={handleInputChange}
              />
            </div>

            {/* Category Field */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="category"
              >
                Category
              </label>
              <select
                className="rounded-md border border-gray-300 p-2 shadow-sm focus:border-helpMe-500 focus:outline-none focus:ring-1 focus:ring-helpMe-500"
                id="category"
                name="category"
                value={giveawayData.category}
                onChange={handleInputChange}
              >
                <option value="">Select a category</option>
                <option value="education">Education</option>
                <option value="health">Health</option>
                <option value="technology">Technology</option>
                <option value="food">Food</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Tags Field */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="tags"
              >
                Tags
              </label>
              <input
                className="rounded-md border border-gray-300 p-2 shadow-sm focus:border-helpMe-500 focus:outline-none focus:ring-1 focus:ring-helpMe-500"
                type="text"
                id="tags"
                name="tags"
                value={giveawayData.tags}
                onChange={handleInputChange}
                placeholder="Separate tags with commas"
              />
            </div>

            {/* Description Field - Full Width */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="description"
              >
                Description
              </label>
              <textarea
                className="min-h-[100px] rounded-md border border-gray-300 p-2 shadow-sm focus:border-helpMe-500 focus:outline-none focus:ring-1 focus:ring-helpMe-500"
                id="description"
                name="description"
                value={giveawayData.description}
                onChange={handleInputChange}
                placeholder="Describe your giveaway"
              />
            </div>

            {/* Requirements Field */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="requirements"
              >
                Requirements
              </label>
              <textarea
                className="min-h-[80px] rounded-md border border-gray-300 p-2 shadow-sm focus:border-helpMe-500 focus:outline-none focus:ring-1 focus:ring-helpMe-500"
                id="requirements"
                name="requirements"
                value={giveawayData.requirements}
                onChange={handleInputChange}
                placeholder="List any requirements for participants"
              />
            </div>

            {/* Prizes Field */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="prizes"
              >
                Prizes
              </label>
              <textarea
                className="min-h-[80px] rounded-md border border-gray-300 p-2 shadow-sm focus:border-helpMe-500 focus:outline-none focus:ring-1 focus:ring-helpMe-500"
                id="prizes"
                name="prizes"
                value={giveawayData.prizes}
                onChange={handleInputChange}
                placeholder="Describe the prizes"
              />
            </div>

            {/* Rules Field */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="rules"
              >
                Rules
              </label>
              <textarea
                className="min-h-[80px] rounded-md border border-gray-300 p-2 shadow-sm focus:border-helpMe-500 focus:outline-none focus:ring-1 focus:ring-helpMe-500"
                id="rules"
                name="rules"
                value={giveawayData.rules}
                onChange={handleInputChange}
                placeholder="List the rules for your giveaway"
              />
            </div>

            {/* Image Upload Field */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="image"
              >
                Upload Image
              </label>
              <div className="flex w-full items-center justify-center">
                <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
                  {fileName ? (
                    <div className="relative h-full w-full">
                      <img
                        src={fileName}
                        alt="Preview"
                        className="h-full w-full rounded-lg object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity hover:opacity-100">
                        <span className="text-sm text-white">
                          Click to change image
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pb-6 pt-5">
                      <svg
                        className="mb-4 h-8 w-8 text-gray-500"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG or JPEG (MAX. 2MB)
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*, image/jpeg, image/png, image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              {fileName && (
                <p className="text-sm text-green-600">
                  ✓ Image selected successfully
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-4 flex justify-center">
            <button
              className="rounded-md bg-helpMe-500 px-6 py-3 font-semibold text-white shadow-md transition-colors duration-200 hover:bg-helpMe-600"
              type="submit"
            >
              Create Giveaway
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
