import axios from "axios";

const NEXT_PUBLIC_API_BASE = process.env.NEXT_PUBLIC_API_BASE as string;

const api = axios.create({
  baseURL: NEXT_PUBLIC_API_BASE?.replace(/\/$/, ''), // Remove trailing slash
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

//token automatically save
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = token;
    }
  }
  return config;
});
//login 
export const login = async (data: { email: string; password: string }) => {
  try {
    const response = await api.post("/auth", data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// CURRENT USER
export const getMe = async () => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};
// GET All
export const getAll = async (endpoint: string,params:Record<string,any>={}) => {
  try {
    const response = await api.get(endpoint,{ params });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

//  GET by ID
export const getById = async (endpoint: string, id: string) => {
  try {
    const response = await api.get(`/${endpoint}/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

//  CREATE
export const createOne = async (endpoint: string, data: any) => {
  try {
    const response = await api.post(`/${endpoint}`,data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

//  UPDATE 
export const updateOne = async (endpoint: string, id: string, data: any) => {
  try {
    const response = await api.put(`/${endpoint}/${id}`,data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// UPDATE PROFILE (users)
export const updateProfile = async (id: string, data: any) => {
  try {
    const response = await api.put(`/auth/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

//  DELETE
export const deleteOne = async (endpoint: string, id: string) => {
  try {
    const response = await api.delete(`/${endpoint}/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// LOGOUT
export const logout = async () => {
  try {
    const response = await api.post("/auth/logout"); 
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// CHANGE PASSWORD
export const changePassword = async (payload: { currentPassword: string; newPassword: string }) => {
  try {
    const response = await api.post('/auth/change-password', payload);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
}

// UPDATE PROFILE API
export const updateProfileApi = async (id: string, payload: { firstName?: string; lastName?: string; email?: string; phoneNumber?: number }) => {
  try {
    const response = await api.put(`/auth/${id}`, payload);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
}
//  Get notes
export const getNotes = async (leadId: string) => {
  const response = await api.get(`/note/${leadId}/notes`);
  return response.data;
};

//  Add note
export const addNote = async (leadId: string, noteData: { content: string }) => {
  const response = await api.post(`/note/${leadId}/notes`, noteData);
  return response.data;
};

//  Update note 
export const updateNoteApi = async (noteId: string, noteData: { content: string }) => {
  const response = await api.put(`/note/notes/${noteId}`, noteData);
  return response.data;
};

//  Delete note 
export const deleteNoteApi = async (noteId: string) => {
  const response = await api.delete(`/note/notes/${noteId}`);
  return response.data;
};
