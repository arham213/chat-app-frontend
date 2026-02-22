export interface SignUpData {
    username: string;
    email: string;
    password: string;
}

export interface SignInData {
    email: string;
    password: string;
}

export interface User {
    id: string,
    username: string,
    email: string
    token: string,
}