import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import { Signup } from "../pages/auth/sign-up";
import { SignIn } from "../pages/auth/sign-in";
import Dashboard from "../pages/Dashboard";

export const router = createBrowserRouter([
    {
        element: <MainLayout />,
        children: [
            { path: '/dashboard', element: <Dashboard /> },
        ]
    },
    {
        path: "/",
        element: <AuthLayout />,
        children: [
            { index: true, element: <SignIn /> },
            { path: "/auth/sign-up", element: <Signup /> },
        ]
    }
])