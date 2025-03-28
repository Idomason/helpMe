import { useState } from "react";
import { useGiveawayImage } from "../../hooks/useGiveawayImage";
import { useMutation } from "@tanstack/react-query";

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

const initialData: GiveawayPropData = {
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
};

export default function GiveawayForm() {
  const [giveawayData, setGiveawayData] = useState(initialData);

  // Cloudinary image upload hook
  const { handleImageUpload } = useGiveawayImage();

  const { mutate: createGiveaway } = useMutation({
    mutationFn: async (newData: GiveawayPropData) => {
      try {
        const response = await fetch("/api/v1/giveaways", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newData),
        });

        if (!response.ok)
          throw new Error(
            `Server returned ${response.status}: ${response.statusText}`,
          );

        return response.json();
      } catch (error) {
        throw error;
      }
    },
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const image = formData.get("image") as File;
    const imageUrl = await handleImageUpload(image);

    const newGiveaway = {
      ...giveawayData,
      image: imageUrl,
    };

    createGiveaway(newGiveaway);
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
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG or JPEG (MAX. 2MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*, image/jpeg, image/png, image/jpg"
                    className="hidden"
                  />
                </label>
              </div>
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
