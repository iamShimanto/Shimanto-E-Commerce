import { Route, Routes } from 'react-router'
import { Spinner } from './components/ui/SkeletonLoader'
import React, { Suspense } from 'react'
import Layout from './components/layout/Index'
const Home = React.lazy(() => import('./pages/Home'))
const Products = React.lazy(() => import('./pages/Products'))
const ProductDetails = React.lazy(() => import('./pages/ProductDetails'))
const Cart = React.lazy(() => import('./pages/Cart'))
const Checkout = React.lazy(() => import('./pages/Checkout'))


const App = () => {
  return (
    <>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path='/' element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:slug" element={<ProductDetails />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}

export default App