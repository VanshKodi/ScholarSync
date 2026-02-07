import { supabase } from '../scripts/supabase.js'

export async function DashboardOverview() {
  const { data: { user }, error } = await supabase.auth.getUser()

  const nameFromEmail = user?.email?.split('@')[0]

  const displayName =
    user?.user_metadata?.username ??
    nameFromEmail ??
    'User'

  return `
    <div class="dashboard-overview">
      <h3>Overview</h3>
      <p class="dashboard-overview-name">Hello ${displayName}</p>
    </div>

    <div class="maincontent-placeholder">
      <p>Welcome to ScholarSync! This is your dashboard overview. Still a work in progress but will include temporary chat ,using chatbot that can tell you how to use the website , as it will have access to documentation of project .</p>
    </div>
  `
}