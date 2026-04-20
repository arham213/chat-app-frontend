import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import ProtectedRoute from "./ProtectedRoute";
import { Signup } from "../pages/auth/sign-up";
import { SignIn } from "../pages/auth/sign-in";
import Dashboard from "../pages/Dashboard";

export const router = createBrowserRouter([
    // Protected routes — require authentication
    {
        element: <ProtectedRoute />,
        children: [
            { path: '/dashboard', element: <Dashboard /> },
        ]
    },
    // Public / auth routes
    {
        element: <AuthLayout />,
        children: [
            { path: "/", index: true, element: <SignIn /> },
            { path: "/auth/sign-up", element: <Signup /> },
        ]
    }
])