import toast from "react-hot-toast";
import { LoaderPinwheel, Upload } from "lucide-react";
import ShortHeader from "../ShortHeader/ShortHeader";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRequestImage } from "../../hooks/useRequestImage";

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
  image: File | { url: string; publicId: string } | null;
};

const initialData: RequestPropData = {
  name: "",
  category: "",
  requestDescription: "",
  city: "",
  state: "",
  country: "",
  specificDetails: {
    amount: 0,
    deadline: "",
  },
  image: null,
};

export default function RequestForm() {
  const [requestData, setRequestData] = useState(initialData);
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const requestImgRef = useRef(null);
  const queryClient = useQueryClient();

  // Cloudinary image upload hook
  const { handleImageUpload } = useRequestImage();

  // Save request to db
  const { mutate: createRequest, isLoading } = useMutation({
    mutationFn: async (newData: RequestPropData) => {
      try {
        const response = await fetch("/api/v1/requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newData),
        });

        if (!response.ok)
          throw new Error(
            `Server returned ${response.status}: ${response.statusText}`,
          );
        const data = await response.json();
        if (!data) {
          return toast.error(data.error.message || "Failed to create request");
        }
        return data;
      } catch (error: any) {
        console.error("Error creating request:", error);
        throw new Error(error.message || "Failed to create request");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Request created successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred";
      toast.error(errorMessage);
    },
  });

  //   for update: event: React.ChangeEvent for submit: event: React.FormEvent for click: event: React.MouseEvent
  async function handleRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);

    if (requestData.image) {
      try {
        const uploadedImage = await handleImageUpload(requestData.image);

        // Create a new object and add the image url
        const requestDataToSave = { ...requestData, image: uploadedImage };

        // Save to db once the image is uploaded
        createRequest(requestDataToSave);

        // Clear form
        setRequestData(initialData);
        setIsSubmitting(false);
        setFileName("");
      } catch (error: any) {
        toast.error(error.message || "Image upload failed");
        return;
      }
    }
  }

  function handleImage(event: any) {
    let file = event.target.files[0];

    if (file && file.type.startsWith("image/")) {
      setFileName(file.name);
      setRequestData({ ...requestData, image: file });
      file = null;
    } else {
      return toast.error("Please select a valid image file");
    }
  }

  useEffect(() => {
    nameRef.current?.focus();
  }, []);
  return (
    <div className="py-24">
      <div className="mx-auto px-4 pt-10 md:w-11/12">
        {/* Heading */}
        <ShortHeader heading="Make Your Request" />
        <form onSubmit={handleRequest} className="mx-auto bg-helpMe-950 p-4">
          <div className="flex flex-col">
            <label
              className="py-2 font-medium text-white/85 xl:text-lg"
              htmlFor="user"
            >
              Full Name
            </label>
            <input
              className="w-72 rounded-sm bg-white px-4 py-1.5 shadow outline-none transition-all duration-200 ease-in-out focus:border-b-2 focus:border-helpMe-900 xl:p-2"
              type="text"
              name="user"
              id="user"
              ref={nameRef}
              value={requestData.name}
              onChange={(event) =>
                setRequestData({ ...requestData, name: event.target.value })
              }
              required
            />
          </div>
          <h3 className="pb-8 pt-20 font-bold text-white xl:text-lg">
            Basic Information
          </h3>
          <p className="font-medium text-white/85 xl:text-lg">
            What kind of help do you need?
          </p>

          <select
            className="mt-1.5 w-72 rounded-sm p-2 outline-none"
            name="category"
            id="category"
            value={requestData.category}
            onChange={(event) =>
              setRequestData({ ...requestData, category: event.target.value })
            }
            required
          >
            <option value="">Select a category</option>
            <option className="" value="medical">
              Medical
            </option>
            <option className="" value="accident">
              Accident
            </option>
            <option className="" value="agriculture">
              Agriculture
            </option>
            <option className="" value="disaster">
              Disaster
            </option>
            <option className="" value="academics">
              Academics
            </option>
          </select>

          <div className="flex flex-col py-4">
            <label
              className="inline-block py-1.5 font-medium text-white xl:text-lg"
              htmlFor="requestBody"
            >
              Briefly describe your situation
            </label>
            <textarea
              className="rounded-sm p-4 outline-none md:w-1/2 xl:text-lg"
              name="requestBody"
              id=""
              value={requestData.requestDescription}
              onChange={(event) =>
                setRequestData({
                  ...requestData,
                  requestDescription: event.target.value,
                })
              }
              cols={40}
              rows={10}
              required
            ></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* City */}
            <div className="flex flex-col py-4">
              <label
                className="inline-block py-1.5 font-medium text-white/85 xl:text-lg"
                htmlFor="city"
              >
                City
              </label>
              <select
                className="mt-1.5 w-72 rounded-sm p-2 outline-none"
                name="city"
                id="city"
                value={requestData.city}
                onChange={(event) =>
                  setRequestData({ ...requestData, city: event.target.value })
                }
                required
              >
                <option value="">Select City</option>
                <option className="" value="Umuahia">
                  Umuahia
                </option>
                <option className="" value="yola">
                  Yola
                </option>
                <option className="" value="akwaIbom">
                  Akwa Ibom
                </option>
                <option className="" value="anambra">
                  Anambra
                </option>
                <option className="" value="bauchi">
                  Bauchi
                </option>
              </select>
            </div>

            {/* State */}
            <div className="flex flex-col py-4">
              <label
                className="inline-block py-1.5 font-medium text-white/85 xl:text-lg"
                htmlFor="state"
              >
                State
              </label>
              <select
                className="mt-1.5 w-72 rounded-sm p-2 outline-none"
                name="state"
                id="state"
                value={requestData.state}
                onChange={(event) =>
                  setRequestData({ ...requestData, state: event.target.value })
                }
                required
              >
                <option value="">Select State</option>
                <option className="" value="Abia">
                  Abia
                </option>
                <option className="" value="adamawa">
                  Adamawa
                </option>
                <option className="" value="akwaIbom">
                  Akwa Ibom
                </option>
                <option className="" value="anambra">
                  Anambra
                </option>
                <option className="" value="bauchi">
                  Bauchi
                </option>
              </select>
            </div>

            {/* Country */}
            <div className="flex flex-col py-4">
              <label
                className="inline-block py-1.5 font-medium text-white/85 xl:text-lg"
                htmlFor="country"
              >
                Country
              </label>
              <select
                className="mt-1.5 w-72 rounded-sm p-2 outline-none"
                name="country"
                id="country"
                value={requestData.country}
                onChange={(event) =>
                  setRequestData({
                    ...requestData,
                    country: event.target.value,
                  })
                }
                required
              >
                <option value="">Select Country</option>
                <option className="" value="nigeria">
                  Nigeria
                </option>
                <option className="" value="togo">
                  Togo
                </option>
                <option className="" value="benin">
                  Benin
                </option>
                <option className="" value="bourkinaFaso">
                  Bourkina Faso
                </option>
                <option className="" value="mali">
                  Mali
                </option>
              </select>
            </div>
          </div>
          <h3 className="pb-8 pt-20 font-bold text-white xl:text-lg">
            Specific Details
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col">
              <label
                className="py-2 font-medium text-white/85 xl:text-lg"
                htmlFor="amount"
              >
                How much money do you need?
              </label>
              <input
                className="w-72 rounded-sm bg-white px-4 py-1.5 shadow outline-none transition-all duration-200 ease-in-out focus:border-b-2 focus:border-helpMe-900 xl:p-2"
                type="number"
                name="amount"
                id="amount"
                value={requestData.specificDetails?.amount}
                onChange={(event) =>
                  setRequestData({
                    ...requestData,
                    specificDetails: {
                      ...requestData.specificDetails,
                      amount: +event.target.value,
                    },
                  })
                }
                placeholder="Enter amount"
              />
            </div>
            <div className="flex flex-col">
              <label
                className="py-2 font-medium text-white/85 xl:text-lg"
                htmlFor="deadline"
              >
                When do you need it by?
              </label>
              <input
                className="w-72 rounded-sm bg-white px-4 py-1.5 shadow outline-none transition-all duration-200 ease-in-out focus:border-b-2 focus:border-helpMe-900 xl:p-2"
                type="date"
                name="deadline"
                value={requestData.specificDetails?.deadline}
                onChange={(event) =>
                  setRequestData({
                    ...requestData,
                    specificDetails: {
                      ...requestData.specificDetails,
                      deadline: event.target.value,
                    },
                  })
                }
                id="deadline"
              />
            </div>

            <div className="flex flex-col">
              <label
                className="mt-10 flex w-max cursor-pointer space-x-2 rounded bg-slate-500 px-2.5 py-2 font-medium text-white/85 xl:text-lg"
                htmlFor="requestImage"
                // onClick={() => requestImgRef.current.click()}
              >
                <Upload />
                <span>
                  {fileName ? `Selected File: ${fileName}` : "Upload Image"}
                </span>
              </label>
              <input
                ref={requestImgRef}
                hidden
                type="file"
                name="file"
                id="requestImage"
                accept="image/jpeg, image/png"
                className="w-72 rounded-sm bg-white px-4 py-1.5 shadow outline-none transition-all duration-200 ease-in-out focus:border-b-2 focus:border-helpMe-900 xl:p-2"
                onChange={(event) => handleImage(event)}
                alt="Request Image"
              />
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center space-x-8 py-10 sm:flex sm:justify-around">
            <button
              className="rounded-sm bg-helpMe-500 px-12 py-2.5 tracking-wider text-white transition-all duration-200 ease-in hover:bg-helpMe-900 hover:font-bold"
              type="submit"
            >
              {isLoading || isSubmitting ? (
                <LoaderPinwheel className="animate-spin" />
              ) : (
                "Submit"
              )}
            </button>
            <button
              className="rounded-sm bg-rose-500 px-12 py-2.5 tracking-wider text-white transition-all duration-200 ease-in hover:bg-pink-950 hover:font-bold"
              type="reset"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
