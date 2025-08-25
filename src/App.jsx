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

const App = () => {
  return (
    <div>
      <BrowserRouter>
      

            <Routes>
                <Route exact path="/catalog_dashboard" element={<CatalogDashboard />} />
                <Route exact path="/catalog/:id/:name" element={<CatalogCategory />} />
                <Route exact path="/customers" element={<Customers />} />
                <Route exact path="/deliveries" element={<Deliveries />} />
                <Route exact path="/delivery_drivers" element={<DeliveryDrivers />} />
                <Route exact path="/orders" element={<Orders />} />
                <Route exact path="/order" element={<OrderDetails />} />
                <Route exact path="/registration" element={<CreateCustomerReg />} />
                <Route exact path="/admin_login" element={<AdminLogin />} />
                <Route exact path="/login" element={<CustomerLogin />} />
                <Route exact path="/delivery_login" element={<DeliveryLogin />} />
                <Route exact path="/register" element={<CreateCustomerReg />} />
                <Route exact path="/basket" element={<Basket />} />
                <Route exact path="/browse" element={<BrowseCategory />} />
                <Route exact path="/browse_food/:id/:name" element={<BrowseCatalog />} />
                <Route exact path="/food_details/:id/" element={<ItemDetails />} />
                <Route exact path="/deliveries_list" element={<DeliveriesList />} />
                <Route exact path="/customers/:id" element={<CustomersUpdate />} />
                <Route exact path="/checkout/:id" element={<Checkout />} />

            </Routes>
</BrowserRouter>
    </div>
  )
}

export default App