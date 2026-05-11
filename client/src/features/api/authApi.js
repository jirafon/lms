import {createApi} from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice";
import { createAuthBaseQuery } from "./createAuthBaseQuery";

// const USER_API = "http://localhost:3010/api/v1/user/"

const USER_API = import.meta.env.VITE_API_BASE_URL 
  ? import.meta.env.VITE_API_BASE_URL + "/user"
  : "http://localhost:3010/api/v1/user";

export const authApi = createApi({
    reducerPath:"authApi",
    baseQuery:createAuthBaseQuery(USER_API),
    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: (inputData) => ({
                url:"register",
                method:"POST",
                body:inputData
            })
        }),
        loginUser: builder.mutation({
            query: (inputData) => ({
                url:"login",
                method:"POST",
                body:inputData
            }),
            async onQueryStarted(_, {queryFulfilled, dispatch}) {
                try {
                    const result = await queryFulfilled;
                    if (result.data.token) {
                        localStorage.setItem("token", result.data.token);
                    }
                    dispatch(userLoggedIn({user:result.data.user}));
                } catch {
                    return;
                }
            }
        }),
        forgotPassword: builder.mutation({
            query: (inputData) => ({
                url:"forgot-password",
                method:"POST",
                body:inputData
            })
        }),
        resetPassword: builder.mutation({
            query: ({ token, ...inputData }) => ({
                url:`reset-password/${token}`,
                method:"POST",
                body:inputData
            })
        }),
        logoutUser: builder.mutation({
            query: () => ({
                url:"logout",
                method:"GET"
            }),
            async onQueryStarted(_, {queryFulfilled, dispatch}) {
                try {
                    await queryFulfilled;
                    localStorage.removeItem("token");
                    dispatch(userLoggedOut());
                } catch {
                    return;
                }
            }
        }),
        loadUser: builder.query({
            query: () => ({
                url:"profile",
                method:"GET"
            }),
            async onQueryStarted(_, {queryFulfilled, dispatch}) {
                try {
                    const result = await queryFulfilled;
                    dispatch(userLoggedIn({user:result.data.user}));
                } catch (error) {
                    dispatch(userLoggedOut());
                }
            }
        }),
        updateUser: builder.mutation({
            query: (formData) => ({
                url:"profile/update",
                method:"PUT",
                body:formData,
                credentials:"include"
            })
        })
    })
});
export const {
    useRegisterUserMutation,
    useLoginUserMutation,
    useForgotPasswordMutation,
    useLogoutUserMutation,
    useLoadUserQuery,
    useResetPasswordMutation,
    useUpdateUserMutation
} = authApi;
