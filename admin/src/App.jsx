import { lazy, Suspense } from "react"
import { Toaster } from "react-hot-toast"
import { Navigate, Route, Routes } from "react-router"

const Layout = lazy(() => import("./components/layout/Index"))
const RequireAuth = lazy(() => import("./components/auth/RequireAuth"))
const RequireRole = lazy(() => import("./components/auth/RequireRole"))

const DashboardEntry = lazy(() => import("./pages/DashboardEntry"))
const DashboardHome = lazy(() => import("./pages/DashboardHome"))
const StuffDashboard = lazy(() => import("./pages/StuffDashboard"))
const Orders = lazy(() => import("./pages/Orders"))
const Products = lazy(() => import("./pages/Products"))
const Categories = lazy(() => import("./pages/Categories"))
const Customers = lazy(() => import("./pages/Customers"))
const Cart = lazy(() => import("./pages/Cart"))
const Settings = lazy(() => import("./pages/Settings"))
const Login = lazy(() => import("./pages/Login"))
const Profile = lazy(() => import("./pages/Profile"))

function RouteLoading() {
  return (
    <div
      className="min-h-dvh flex items-center justify-center px-4"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      <div className="text-sm font-semibold text-(--text-muted)">Loading…</div>
    </div>
  )
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardEntry />} />

            <Route
              path="admin-dashboard"
              element={
                <RequireRole roles={["admin"]}>
                  <DashboardHome />
                </RequireRole>
              }
            />

            <Route
              path="stuff-dashboard"
              element={
                <RequireRole roles={["stuff"]}>
                  <StuffDashboard />
                </RequireRole>
              }
            />

            <Route path="orders" element={<Orders />} />
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />

            <Route
              path="customers"
              element={
                <RequireRole roles={["admin", "stuff"]}>
                  <Customers />
                </RequireRole>
              }
            />

            <Route
              path="cart"
              element={
                <RequireRole roles={["admin"]}>
                  <Cart />
                </RequireRole>
              }
            />

            <Route path="profile" element={<Profile />} />

            <Route
              path="settings"
              element={
                <RequireRole roles={["admin"]}>
                  <Settings />
                </RequireRole>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}
