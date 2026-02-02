import React from 'react'
import { BrowserRouter as Router, Routes, Route, BrowserRouter} from 'react-router-dom'
import CatalogDashboard from "./Admin/CatalogDashboard.jsx"
import Customers from "./Admin/Customers.jsx"
import CustomersUpdate from "./Admin/Customers.jsx"
import Deliveries from "./Admin/Deliveries.jsx"
import DeliveryDrivers from "./Admin/DeliveryDrivers.jsx"
import Orders from "./Admin/Orders.jsx"
import CreateCustomerReg from "./Auth/CreateCustomerReg.jsx"
import AdminLogin from "./Admin/AdminLogin.jsx"
import DeliveryLogin from "./Delivery/DeliveryLogin.jsx"
import CustomerLogin from "./Customer/CustomerLogin.jsx"
import Basket from "./Customer/Basket.jsx"
import BrowseCategory from "./Customer/BrowseCategory.jsx"
import BrowseCatalog from './Customer/BrowseCatalog.jsx'
import ItemDetails from './Customer/ItemDetails.jsx'

import DeliveriesList from './Delivery/DeliveriesList.jsx'
import CatalogCategory from './Admin/CatalogCategory.jsx'
import OrderDetails from './Customer/OrderDetails.jsx'
import Checkout from './Customer/Checkout.jsx'
import { Outlet, NavLink } from "react-router-dom";
import OrderHistory from './Customer/OrderHistory.jsx'
import SearchResults from './components/SearchResults.jsx'
import { AuthProvider} from './Auth/AuthContext.jsx'
import ProtectedRoute from './Auth/ProtectedRoute.jsx'

const App = () => {
  return (
    <div>
      <AuthProvider>
      <BrowserRouter>
      

            <Routes>

  <Route path="/admin_login" element={<AdminLogin />} />
  <Route path="/login" element={<CustomerLogin />} />
  <Route path="/delivery_login" element={<DeliveryLogin />} />
  <Route path="/register" element={<CreateCustomerReg />} />

                  <Route
                    path="/catalog_dashboard"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <CatalogDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/catalog/:id/:name"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <CatalogCategory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/customers"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <Customers />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/deliveries"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <Deliveries />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/delivery_drivers"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <DeliveryDrivers />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <Orders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/customers/:id"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <CustomersUpdate />
                      </ProtectedRoute>
                    }
                  />

                 
                  <Route
                    path="/order"
                    element={
                      <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                        <OrderDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/basket"
                    element={
                      <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                        <Basket />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/browse"
                    element={
                      <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                        <BrowseCategory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/browse_food/:id/:name"
                    element={
                      <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                        <BrowseCatalog />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/food_details/:id/"
                    element={
                      <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                        <ItemDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout/:id"
                    element={
                      <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/order_history"
                    element={
                      <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                        <OrderHistory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/search"
                    element={
                      <ProtectedRoute allowedRoles={["CUSTOMER", "ADMIN"]}>
                        <SearchResults />
                      </ProtectedRoute>
                    }
                  />

                  
                  <Route
                    path="/deliveries_list"
                    element={
                      <ProtectedRoute allowedRoles={["DELIVERY"]}>
                        <DeliveriesList />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
</BrowserRouter>
</AuthProvider>
    </div>
  )
}

export default App