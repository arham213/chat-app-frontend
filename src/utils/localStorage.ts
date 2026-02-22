import { User } from "../types/auth";

export const saveUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
}

export const getUser = (): User | null => {
    const user = localStorage.getItem('user');
    if (user) return JSON.parse(user);
    return null;
}

export const deleteUser = () => {
    localStorage.removeItem('user');
}