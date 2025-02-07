import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { createCabin } from "../services/apiCabins";
import toast from "react-hot-toast";

export default function Recruite() {
  const { register, handleSubmit, reset, getValues, formState } = useForm();
  const { errors } = formState;
  console.log(errors);

  const queryClient = useQueryClient();
  const { isLoading, mutate, error } = useMutation({
    mutationFn: createCabin,
    onSuccess: () => {
      toast.success("New cabin created successfully");
      queryClient.invalidateQueries({
        queryKey: ["cabins"],
      });
      reset();
    },
    onError: (err) => toast.error(err.message),
  });

  function submit(data) {
    mutate(data);
  }

  function onError(error) {
    console.log(error);
  }

  return (
    <div className="px-6 py-2">
      <div className="mx-auto">
        <form onSubmit={handleSubmit(submit, onError)}>
          <div className="mb-3 rounded-md bg-emerald-400 px-4 py-2 shadow">
            <label className="font-semibold" htmlFor="name">
              Name
            </label>
            <input
              className="ml-2 w-60 rounded-sm p-1 pl-3"
              className="ml-2 w-60 rounded-sm p-1 pl-3"
              type="text"
              name="name"
              id="name"
              {...(register("name"), { required: "This field is required" })}
            />
          </div>
          <div className="mb-3 rounded-md bg-emerald-400 px-4 py-2 shadow">
            <label className="font-semibold" htmlFor="maxCapacity">
              maxCapacity
            </label>
            <input
              className="ml-2 w-60 rounded-sm p-1 pl-3"
              type="number"
              name="maxCapacity"
              id="maxCapacity"
              {...(register("maxCapacity"),
              {
                required: "This field is required",
                min: {
                  value: 1,
                  message: "Value must be at least 1",
                },
              })}
            />
          </div>
          <div className="mb-3 rounded-md bg-emerald-400 px-4 py-2 shadow">
            <label className="font-semibold" htmlFor="regularPrice">
              regularPrice
            </label>
            <input
              className="ml-2 w-60 rounded-sm p-1 pl-3"
              type="number"
              name="regularPrice"
              id="regularPrice"
              {...(register("regularPrice"),
              {
                required: "This field is required",
                min: {
                  value: 50,
                  message: "Value must be at least 50",
                },
              })}
            />
          </div>
          <div className="mb-3 rounded-md bg-emerald-400 px-4 py-2 shadow">
            <label className="font-semibold" htmlFor="discount">
              discount
            </label>
            <input
              className="ml-2 w-60 rounded-sm p-1 pl-3"
              type="number"
              name="discount"
              id="discount"
              {...register("discount", {
                required: "This field is required",
                validate: (value) =>
                  value < getValues().regularPrice ||
                  "Discount should be less than regular price",
              })}
            />
          </div>
          <div className="mb-3 rounded-md bg-emerald-400 px-4 py-2 shadow">
            <label className="font-semibold" htmlFor="description">
              description
            </label>
            <input
              className="ml-2 w-60 rounded-sm p-1 pl-3"
              type="text"
              name="description"
              id="description"
              {...(register("description"),
              { required: "This field is required" })}
            />
          </div>
          {/* <div>
            <label htmlFor="profileImage">Image</label>
            <input
              type="file"
              name="profileImage"
              id="profileImage"
              accept="image/*"
              {...register("profileImage")}
            />
          </div> */}

          <div className="flex justify-center space-x-5 py-4">
            <button
              className="rounded-md bg-red-500 px-6 py-1.5 font-semibold text-white shadow transition-colors duration-300 ease-in hover:bg-red-700"
              type="reset"
            >
              Clear
            </button>
            <button
              disabled={isLoading}
              className="rounded-md bg-blue-500 px-6 py-1.5 font-semibold text-white shadow transition-colors duration-300 ease-in hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
