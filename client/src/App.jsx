import { Route, Routes } from "react-router";
import React, { Suspense } from "react";
import { Spinner } from "./components/ui/SkeletonLoader";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import PublicOnlyRoute from "./components/routes/PublicOnlyRoute";
import Layout from "./components/layout/Index";
import Faq from "./pages/Faq";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Careers from "./pages/Careers";

const Home = React.lazy(() => import("./pages/Home"));
const Products = React.lazy(() => import("./pages/Products"));
const ProductDetails = React.lazy(() => import("./pages/ProductDetails"));
const Cart = React.lazy(() => import("./pages/Cart"));
const Checkout = React.lazy(() => import("./pages/Checkout"));
const Profile = React.lazy(() => import("./pages/Profile"));
const About = React.lazy(() => import("./pages/About"));
const Contact = React.lazy(() => import("./pages/Contact"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const ForgetPassword = React.lazy(() => import("./pages/ForgetPassword"));
const VerifyOtp = React.lazy(() => import("./pages/VerifyOtp"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));


const App = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public Routes */}
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:slug" element={<ProductDetails />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="faq" element={<Faq />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="careers" element={<Careers />} />

          {/* Protected Routes */}
          <Route
            path="checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          {/* Public Only Auth Routes */}
          <Route
            path="register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="forget-password"
            element={
              <PublicOnlyRoute>
                <ForgetPassword />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="verify-otp"
            element={
              <PublicOnlyRoute>
                <VerifyOtp />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="auth/resetpass"
            element={
              <PublicOnlyRoute>
                <ResetPassword />
              </PublicOnlyRoute>
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;