import apiClient from "../api/apiClient";
import { SignInData, SignUpData } from "../types/auth";

export const registerUser = async (signupData: SignUpData) => {
    const response = await apiClient.post("/auth/register", signupData);
    return response.data;
}

export const loginUser = async (loginData: SignInData) => {
    const response = await apiClient.post("/auth/login", loginData);
    return response.data;
}