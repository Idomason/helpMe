import { FormEvent, useState } from "react";
import ShortHeader from "../ShortHeader/ShortHeader";

const initialData = {
  name: "",
  category: "",
  requestDescription: "",
  city: "",
  state: "",
  country: "",
  specificDetails: {
    amount: "",
    deadline: "",
  },
};

export default function RequestForm() {
  const [requestData, setRequestData] = useState(initialData);

  //   for update: event: React.ChangeEvent for submit: event: React.FormEvent for click: event: React.MouseEvent
  function handleRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log(requestData);

    // Clear form
    setRequestData(initialData);
  }
  return (
    <div className="py-24">
      <div className="mx-auto px-4 pt-10 md:w-11/12">
        {/* Heading */}
        <ShortHeader heading="Make Your Request" />
        <form onSubmit={handleRequest} className="mx-auto bg-helpMe-200 p-4">
          <div className="flex flex-col">
            <label
              className="py-2 font-medium text-helpMe-950 xl:text-lg"
              htmlFor="user"
            >
              Full Name
            </label>
            <input
              className="w-72 rounded-sm bg-white px-4 py-1.5 shadow outline-none transition-all duration-200 ease-in-out focus:border-b-2 focus:border-helpMe-900 xl:p-2"
              type="text"
              name="user"
              id="user"
              value={requestData.name}
              onChange={(event) =>
                setRequestData({ ...requestData, name: event.target.value })
              }
              required
            />
          </div>
          <h3 className="pb-8 pt-20 font-bold text-helpMe-950 xl:text-lg">
            Basic Information
          </h3>
          <p className="font-medium text-helpMe-950 xl:text-lg">
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
              className="inline-block py-1.5 font-medium text-helpMe-950 xl:text-lg"
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
                className="inline-block py-1.5 font-medium text-helpMe-950 xl:text-lg"
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
                className="inline-block py-1.5 font-medium text-helpMe-950 xl:text-lg"
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
                className="inline-block py-1.5 font-medium text-helpMe-950 xl:text-lg"
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
          <h3 className="pb-8 pt-20 font-bold text-helpMe-950 xl:text-lg">
            Specific Details
          </h3>
          <div className="grid md:grid-cols-2">
            <div className="flex flex-col">
              <label
                className="py-2 font-medium text-helpMe-950 xl:text-lg"
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
                className="py-2 font-medium text-helpMe-950 xl:text-lg"
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
          </div>

          <div className="mt-10 flex items-center justify-center space-x-8 py-10 sm:flex sm:justify-around">
            <button
              className="rounded-sm bg-helpMe-500 px-12 py-2.5 tracking-wider text-white transition-all duration-200 ease-in hover:bg-helpMe-950 hover:font-bold"
              type="submit"
            >
              Submit
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
