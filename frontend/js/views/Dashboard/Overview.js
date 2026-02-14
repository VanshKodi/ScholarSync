import { supabase } from "../../utils/supabase.js";

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
  `;
}