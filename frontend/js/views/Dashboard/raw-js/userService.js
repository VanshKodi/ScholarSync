import { supabase } from "../supabaseClient.js";

export const userService = {

  async getAuthUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getProfile(userId) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    return data;
  },

  async updateProfile(userId, updates) {
    return supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId);
  },

  async createOrganization(payload) {
    const { data } = await supabase
      .from("organizations")
      .insert([payload])
      .select()
      .single();

    return data;
  },

  async joinOrganization(userId, orgId) {
    return supabase
      .from("profiles")
      .update({ org_id: orgId })
      .eq("id", userId);
  }

};