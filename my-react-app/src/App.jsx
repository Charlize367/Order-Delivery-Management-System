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
import OrderHistory from './Customer/OrderHistory.jsx'
import SearchResults from './components/SearchResults.jsx'
import { AuthProvider} from './Auth/AuthContext.jsx'
import ProtectedRoute from './Auth/ProtectedRoute.jsx'
import AdminSearch from './components/AdminSearch.jsx'

const App = () => {
  return (
    <div>
      <BrowserRouter>
      <AuthProvider>
      
      

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
                    path="/admin_search"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AdminSearch />
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
                      
                        <OrderDetails />
                      
                    }
                  />
                  <Route
                    path="/basket"
                    element={
                      
                        <Basket />
                     
                    }
                  />
                  <Route
                    path="/browse"
                    element={
                     
                        <BrowseCategory />
                      
                    }
                  />
                  <Route
                    path="/browse_food/:id/:name"
                    element={
                      
                        <BrowseCatalog />
                      
                    }
                  />
                  <Route
                    path="/food_details/:id/"
                    element={
                      
                        <ItemDetails />
                      
                    }
                  />
                  <Route
                    path="/checkout/:id"
                    element={
                     
                        <Checkout />
                      
                    }
                  />
                  <Route
                    path="/order_history"
                    element={
                     
                        <OrderHistory />
                      
                    }
                  />
                  <Route
                    path="/search"
                    element={
                      
                        <SearchResults />
                      
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

</AuthProvider>
</BrowserRouter>
    </div>
  )
}

export default App