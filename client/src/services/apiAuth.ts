import supabase from "./supabase";

type userDataProp = {
  name: string;
  email: string;
  password: string;
  role: string;
};

type userLoginDataProp = {
  email: string;
  password: string;
};

// Register user with email and password
export default async function register({
  name,
  email,
  password,
  role,
}: userDataProp) {
  try {
    // Step 1: Sign up the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
        },
      },
    });

    if (authError) {
      console.error(authError.message);
      throw new Error(`Auth Error: ${authError.message}`);
    }

    const userId = authData?.user?.id;

    // Step 2: Fetch the role ID from the roles table
    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("name", role)
      .single();

    if (roleError || !roleData) {
      console.error(`Role '${role}' not found: ${roleError?.message}`);
      throw new Error(`Role '${role}' not found: ${roleError?.message}`);
    }

    // Step 3: Insert user into the users table
    const { data: insertData, error: insertError } = await supabase
      .from("users")
      .insert([{ id: userId, name, email, role_id: roleData?.id }]);

    if (insertError) {
      console.error("Insert Error:", insertError?.message);
      throw new Error(
        `Error inserting user into 'users' table:" 
      ${insertError?.message}`,
      );
    }

    return { success: true, message: "User registered successfully" };
  } catch (err) {
    if (err) {
      console.error(`Error Registering User: ${err}`);
      console.log(err);
    }
  }
}

// Sign in with google auth provider
export async function signInWithGoogle() {
  try {
    const { data: googleAuthData, error } = await supabase.auth.signInWithOAuth(
      {
        provider: "google",
      },
    );

    console.log(googleAuthData);

    if (error) console.error(`Error signing in: ${error.message}`);

    // const userId = googleAuthData?.user?.id;

    // Step 2: Fetch the role ID from the roles table
    // const { data: roleData, error: roleError } = await supabase
    //   .from("roles")
    //   .select("id")
    //   .eq("name", role)
    //   .single();

    // if (roleError || !roleData) {
    //   console.error(`Role '${role}' not found: ${roleError?.message}`);
    //   throw new Error(`Role '${role}' not found: ${roleError?.message}`);
    // }

    // Step 3: Insert user into the users table
    // const { data: insertData, error: insertError } = await supabase
    //   .from("users")
    //   .insert([{ id: userId, name, email, role_id: roleData?.id }]);

    // if (insertError) {
    //   console.error("Insert Error:", insertError?.message);
    //   throw new Error(
    //     `Error inserting user into 'users' table:"
    //   ${insertError?.message}`,
    //   );
  } catch (error) {
    console.error(error);
  }
}

// Login with email and password
export async function login({ email, password }: userLoginDataProp) {
  try {
    const { data: loginData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(`User not found: ${error.message}`);
    return loginData;
  } catch (error) {
    console.error(error);
  }
}
