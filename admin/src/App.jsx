import { Toaster } from "react-hot-toast"
import { Navigate, Route, Routes } from "react-router"

import Layout from "./components/layout/Index"
import DashboardHome from "./pages/DashboardHome"
import Orders from "./pages/Orders"
import Products from "./pages/Products"
import Categories from "./pages/Categories"
import Customers from "./pages/Customers"
import Cart from "./pages/Cart"
import Settings from "./pages/Settings"
import Login from "./pages/Login"

export default function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<Layout />}>
          <Route index element={<DashboardHome />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="customers" element={<Customers />} />
          <Route path="cart" element={<Cart />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
