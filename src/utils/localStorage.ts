import { User } from "../types/auth";

// Using sessionStorage instead of localStorage so that each browser tab/window
// maintains its own independent session. This allows testing with multiple users
// in separate windows without them sharing login state.

export const saveUser = (user: User) => {
    sessionStorage.setItem('user', JSON.stringify(user));
}

export const getUser = (): User | null => {
    const user = sessionStorage.getItem('user');
    if (user) return JSON.parse(user);
    return null;
}

export const deleteUser = () => {
    sessionStorage.removeItem('user');
}