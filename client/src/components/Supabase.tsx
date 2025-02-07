import { useQuery } from "@tanstack/react-query";
import { getCabins } from "../services/apiCabins";
import SupaCabin from "./SupaCabin";
import { useState } from "react";
import Recruite from "./Recruite";

export default function Supabase() {
  const [showProfile, setShowProfile] = useState(false);
  const { isLoading, data, error } = useQuery({
    queryKey: ["cabins"],
    queryFn: getCabins,
  });

  if (isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center text-5xl text-emerald-700">
        <h2>LOADING...</h2>
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center text-5xl text-emerald-700">
        <h2>An error occurred!</h2>
      </div>
    );

  return (
    <div className="bg-emerald-700 py-24">
      <div className="min-h-screen bg-emerald-500 py-14">
        {data && data.length > 0 ? (
          data.map((cabin) => (
            <div key={cabin.id} className="px-6">
              <SupaCabin cabin={cabin} />
            </div>
          ))
        ) : (
          <p>No cabin yet, add some cabins</p>
        )}

        <div className="flex items-center justify-center py-5">
          <button
            className="rounded-md bg-blue-500 px-6 py-1.5 font-semibold text-white shadow transition-colors duration-300 ease-in hover:bg-blue-700"
            onClick={() => setShowProfile((show) => !show)}
          >
            {showProfile ? "Close Form" : "Add new cabin"}
          </button>
        </div>
        <div>{showProfile && <Recruite />}</div>
      </div>
    </div>
  );
}
