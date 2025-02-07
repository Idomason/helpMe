import supabase from "./supabase";

// Get all cabins
export async function getCabins() {
  const { data, error } = await supabase.from("cabins").select("*");

  if (error) {
    console.error(error);
    throw new Error("Error occurred! Cabins cannot be loaded");
  }

  return data;
}

// Delete a cabin
export async function deleteCabin(id: number) {
  const { error } = await supabase.from("cabins").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Error occurred! Cabin could not be deleted");
  }
}

// Create a cabin
export async function createCabin(newCabin) {
  // 1. create a new cabin
  const imageName = `${Math.random()}-${newCabin.image.name}`.replaceAll(
    "/",
    "",
  );

  const { data, error } = await supabase
    .from("cabins")
    .insert([newCabin])
    .select();

  if (error) {
    console.error(error);
    throw new Error("Error occurred! Cabin could not be created");
  }

  // 2. upload image
}
