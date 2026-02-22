import { Outlet } from "react-router-dom"

const MainLayout = () => {
    return (
        <>
            <main className="container">
                <Outlet />
            </main>
        </>
    )
}

export default MainLayout;