import { supabase } from "../../utils/supabase.js";

const { data, error } = await supabase
  .from("profiles")
  .select("*");

if (error) {
  console.error(error);
} else {
  console.log(data);
}

export async function Overview(container) {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    container.innerHTML = `<p>Not authenticated</p>`;
    return;
  }

  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email;

  container.innerHTML = `
    <h1>Dashboard</h1>
    <p>Welcome, ${name}</p>
    <hr>
    Here is what we know about you , You can correct these if needed.
    <br>
    
  `;
}