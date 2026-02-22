import { Outlet } from "react-router-dom"

const AuthLayout = () => {
    return (
        <main className="container">
            <Outlet />
        </main>
    )
}

export default AuthLayout;