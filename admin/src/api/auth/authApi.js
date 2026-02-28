import api from "../api";

export const authService = {
  // login
  login: async (payload) => {
    const res = await api.post("/api/v1/auth/login", payload);
    return res.data;
  },
  //  profile
  profile: async () => {
    const res = await api.get("/api/v1/auth/profile");
    return res.data;
  },
};
