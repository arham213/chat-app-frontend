import apiClient from "../api/apiClient"

export const getChats = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await apiClient.get('/chats', {
        headers: {
            "Authorization": `Bearer ${user?.token}`
        }
    });
    return response.data;
}

export const getAllUsers = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await apiClient.get('/users', {
        headers: {
            "Authorization": `Bearer ${user?.token}`
        }
    });
    return response.data;
}

export const createChat = async (participantId: string) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await apiClient.post('/chats/create', { participantId }, {
        headers: {
            "Authorization": `Bearer ${user?.token}`
        }
    });
    return response.data;
}

export const getChatMessages = async (chatId: string) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await apiClient.get(`/chats/${chatId}/messages`, {
        headers: {
            "Authorization": `Bearer ${user?.token}`
        }
    });
    return response.data;
}

export const uploadChatImage = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file)

    const response = await apiClient.post('/chats/uploadImage', formData)

    return response.data;
}