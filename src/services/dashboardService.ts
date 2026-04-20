import apiClient from "../api/apiClient"
import { getUser } from "../utils/localStorage"

const getAuthHeader = () => {
    const user = getUser();
    return { "Authorization": `Bearer ${user?.token}` };
}

export const getChats = async () => {
    const response = await apiClient.get('/chats', { headers: getAuthHeader() });
    return response.data;
}

export const getAllUsers = async () => {
    const response = await apiClient.get('/users', { headers: getAuthHeader() });
    return response.data;
}

export const createChat = async (participantId: string) => {
    const response = await apiClient.post('/chats/create', { participantId }, { headers: getAuthHeader() });
    return response.data;
}

export const getChatMessages = async (chatId: string) => {
    const response = await apiClient.get(`/chats/${chatId}/messages`, { headers: getAuthHeader() });
    return response.data;
}

export const uploadChatImage = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file)
    const response = await apiClient.post('/chats/uploadImage', formData, { headers: getAuthHeader() })
    return response.data;
}