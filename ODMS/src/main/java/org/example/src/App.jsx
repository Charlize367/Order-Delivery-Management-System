import React from 'react'
import { BrowserRouter as Router, Routes, Route, BrowserRouter} from 'react-router-dom'
import CatalogDashboard from "./Admin/CatalogDashboard.jsx"
import Customers from "./Admin/Customers.jsx"
import Deliveries from "./Admin/Deliveries.jsx"
import DeliveryDrivers from "./Admin/DeliveryDrivers.jsx"
import Orders from "./Admin/Orders.jsx"
import CreateCustomerReg from "./Auth/CreateCustomerReg.jsx"
import Login from "./Auth/Login.jsx"
import Basket from "./Customer/Basket.jsx"
import BrowseCatalog from "./Customer/BrowseCatalog.jsx"
import OrderDeliveryDetails from "./Customer/OrderDeliveryDetails.jsx"
import { Outlet, NavLink } from "react-router-dom";

const App = () => {
  return (
    <div>
      <BrowserRouter>
      

            <Routes>
                <Route exact path="/catalog_dashboard" element={<CatalogDashboard />} />
                <Route exact path="/customers" element={<Customers />} />
                <Route exact path="/deliveries" element={<Deliveries />} />
                <Route exact path="/delivery_drivers" element={<DeliveryDrivers />} />
                <Route exact path="/orders" element={<Orders />} />
                <Route exact path="/registration" element={<CreateCustomerReg />} />
                <Route exact path="/login" element={<Login />} />
                <Route exact path="/basket" element={<Basket />} />
                <Route exact path="/browse" element={<BrowseCatalog />} />
                <Route exact path="/order_delivery_details" element={<OrderDeliveryDetails />} />

            </Routes>
</BrowserRouter>
    </div>
  )
}

export default App