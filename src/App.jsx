import { useState } from 'react'
import './App.css'
import Login from './pages/auth/Login'
import { Routes,Route } from 'react-router-dom'
import Register from './pages/auth/Register'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from './pages/Home'
import ProductMaster from './pages/Masters/ProductMaster'
import GroupProductMaster from './pages/Masters/GroupProductMaster'
import TaxMaster from './pages/Masters/TaxMaster'
import Sales from './pages/Transactions/Sales'
import SalesReturn from './pages/Transactions/SalesReturn'
import Purchase from './pages/Transactions/Purchase'
import PurchaseReturn from './pages/Transactions/PurchaseReturn'
import Financial from './pages/Reports/Financial'
import PayBook from './pages/Reports/Inventory/Sales/PayBook'
import SalesStatement from './pages/Reports/Inventory/Sales/SalesStatement'
import SalesSummary from './pages/Reports/Inventory/Sales/SalesSummary'
import PurchaseReport from './pages/Reports/Inventory/Purchase/PurchaseReport'

function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register/>} />
      <Route path="/home" element={<Home/>} />
      <Route path="/masters/product-master" element={<ProductMaster />} />
      <Route path="/masters/group-product-master" element={<GroupProductMaster />} />
      <Route path="/masters/tax-master" element={<TaxMaster />} />
      <Route path="/transactions/sales" element={<Sales />} />
      <Route path="/transactions/sales-return" element={<SalesReturn />} />
      <Route path="/transactions/purchase" element={<Purchase />} />
      <Route path="/transactions/purchase-return" element={<PurchaseReturn />} />
      <Route path="/reports/financial" element={<Financial />} />
      <Route path="/reports/inventory/sales/pay-book" element={<PayBook />} />
      <Route path="/reports/inventory/sales/sales-statement" element={<SalesStatement />} />
      <Route path="/reports/inventory/sales/sales-summary" element={<SalesSummary />} />
      <Route path="/reports/inventory/purchase/purchase-report" element={<PurchaseReport />} />
    </Routes>
    <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </>
  )
}

export default App
