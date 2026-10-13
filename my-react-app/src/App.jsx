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
import { NotificationProvider } from './Notifications/NotificationContext.jsx'
import NotificationHandler from './Notifications/NotificationHandler.jsx';
import OrderSuccess from './Customer/OrderSuccess.jsx'
import PromoCodes from './Admin/PromoCodes.jsx'
import ModifierGroups from './Admin/Modifiers.jsx'
import ComboCreator from './Admin/Combo.jsx'
import BrowseCombos from './Customer/BrowseCombos.jsx'
import KitchenDisplay from './Kitchen/KitchenDisplay.jsx'
import KitchenLogin from './Kitchen/KitchenLogin.jsx'
import KitchenStaff from './Admin/KitchenStaff.jsx'
import Dispatchers from './Admin/Dispatchers.jsx'
import DispatcherDashboard from './Dispatcher/DispatcherDashboard.jsx'
import DispatcherLogin from './Dispatcher/DispatcherLogin.jsx'
import OrderTrackingPage from './Customer/OrderTracking.jsx'
import { requestNotificationPermission } from './Firebase/requestNotificationPermission.js'
import { useEffect } from 'react'
import { listenForMessages } from './Firebase/messageListener.js'
import NotificationToast from './Notifications/NotificationToast.jsx'
import Favorites from './Customer/Favorites.jsx'
import SalesAnalytics from './Admin/Analytics.jsx'
import Unauthorized from './Unauthorized.jsx'

const App = () => {
  useEffect(() => {
    requestNotificationPermission();
    return listenForMessages();
  }, []);

  
  return (
    <div>
      <BrowserRouter>
      <AuthProvider>
      <NotificationProvider>
        <NotificationToast />
       <NotificationHandler />

      

            <Routes>
<Route path="/unauthorized" element={<Unauthorized />} />
  <Route path="/admin_login" element={<AdminLogin />} />
  <Route path="/login" element={<CustomerLogin />} />
  <Route path="/delivery_login" element={<DeliveryLogin />} />
   <Route path="/kitchen_login" element={<KitchenLogin />} />
   <Route path="/dispatcher_login" element={<DispatcherLogin />} />
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
                    path="/promo"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <PromoCodes />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/modifiers"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <ModifierGroups />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/combos"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <ComboCreator />
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
                    path="/kitchen_staff"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <KitchenStaff />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/dispatchers"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <Dispatchers />
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
                    path="/analytics"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <SalesAnalytics />
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
                    path="/browse_combos"
                    element={
                      
                        <BrowseCombos />
                      
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
                     <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/order/:id/success"
                    element={
                     <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                        <OrderSuccess />
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
                    path="/favorites"
                    element={
                     <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                        <Favorites />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/track-order/:id"
                    element={
                     <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                        <OrderTrackingPage />
                      </ProtectedRoute>
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


                   <Route
                    path="/kitchen"
                    element={
                        <ProtectedRoute allowedRoles={["KITCHEN"]}>
                        <KitchenDisplay />
                        </ProtectedRoute>
                      
                    }
                  />

                  <Route
                    path="/dispatcher_dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["DISPATCHER"]}>
                        <DispatcherDashboard />
                         </ProtectedRoute>
                      
                    }
                  />
                </Routes>
</NotificationProvider>
</AuthProvider>
</BrowserRouter>
    </div>
  )
}

export default App