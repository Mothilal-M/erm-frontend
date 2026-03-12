import { Outlet } from "react-router-dom"

const BlankLayout = () => {
  return (
    <main className="min-h-screen">
      <Outlet />
    </main>
  )
}

export default BlankLayout
