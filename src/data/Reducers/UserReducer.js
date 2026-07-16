import { createSlice } from "@reduxjs/toolkit";
import { SetAuthToken } from "../Config";
import { clearErrors, getErrorText } from "./ErrorReducer";
import axios from "axios";
import { toast } from "react-toastify";
import { getSessionUser, SESSION_USER_KEY } from "../adminAuth";

export const TOKEN = "EXAMPREP_LOGIN";

let initialState = {
  user: getSessionUser(),
  token: localStorage.getItem(TOKEN),
  isAuth: Boolean(localStorage.getItem(TOKEN)),
  loading: false,
  isRegistered: false,
  isLoggedIn: false,
  isUpdated: false,
  isPassword: null,
  questionsLength: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, { payload }) => {
      localStorage.setItem(TOKEN, payload?.token);
      state.isLoggedIn = true;
      state.token = payload?.token;
      state.user = payload?.user;
      state.isAuth = true;
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(payload?.user));
    },
    register: (state) => {
      state.isRegistered = true;
    },
    setUser: (state, { payload }) => {
      state.isUpdated = true;
      state.user = payload?.data;
    },
    getUser: (state, { payload }) => {
      if (payload?.token) {
        localStorage.setItem(TOKEN, payload?.token);
      }
      state.user = payload?.data || payload || null;
      state.questionsLength = payload?.questions || null;
      state.isAuth = payload?.data || payload ? true : false;
      state.loading = false;
    },
    getUserFail: (state) => {
      state.isAuth = false;
      state.loading = false;
    },
    getUserLoading: (state) => {
      state.loading = true;
    },
    setPassword: (state) => {
      state.isPassword = true;
    },
    setUserFail: (state) => {
      state.isUpdated = false;
      state.isLoggedIn = false;
      state.isRegistered = false;
      state.isPassword = false;
    },
    logout: (state) => {
      localStorage.removeItem(TOKEN);
      localStorage.removeItem(SESSION_USER_KEY);
      state.isAuth = false;
      state.user = null;
      state.token = null;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  login,
  logout,
  getUser,
  setPassword,
  setUser,
  setUserFail,
  getUserFail,
  getUserLoading,
  register,
} = userSlice.actions;

export default userSlice.reducer;

export const MergedData = (data, payload) => {
  let ids = new Set(payload.map((d) => d._id));
  let updatateData = [...payload, ...data.filter((d) => !ids.has(d._id))];
  return updatateData?.sort((a, b) => a?.createdAt - b?.createdAt);
};

export const EditData = (data, payload) => {
  let updatateData =
    data?.length > 0
      ? data.map((item) => (item._id !== payload._id ? item : payload))
      : data;
  return updatateData;
};

export const DeleteData = (data, payload) => {
  let filterItem =
    data?.length > 0
      ? [...data.filter((item) => item._id !== payload._id)]
      : [];
  return filterItem;
};

// GET USER INFO
export const loadUser = () => async (dispatch) => {
  let token = localStorage.getItem(TOKEN);
  if (token) SetAuthToken(token);
  dispatch(getUserLoading());
  dispatch(clearErrors());
  try {
    let res = await axios.get(`/api/v1/user`);
    if (res?.data) {
      dispatch(getUser(res.data));
    } else {
      dispatch(getUserFail());
    }
  } catch (err) {
    if (err) console.log({ error: err.response?.data, err });
    if (err?.response?.status === 429) toast.error(err?.response?.data);
    dispatch(getUserFail());
    dispatch(getErrorText(err?.response?.data?.message || ""));
  }
};

export const logoutMain = () => async (dispatch) => {
  dispatch(logout());
};

export const imageUpload = async (images) => {
  let imgArr = [];
  for (const item of images) {
    // console.log({ item });
    let post = new FormData();
    post.append(`file`, item);

    let res = await axios.post(`/api/v1/file`, post, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    const data = await res?.data?.data;
    // console.log({ data });
    Array.isArray(data) ? (imgArr = [...imgArr, ...data]) : imgArr.push(data);
  }
  return imgArr;
};
