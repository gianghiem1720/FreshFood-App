import React from 'react'
import './Admin.css'
import Sidebar from '../../Components/Sidebar/Sidebar'
import { Routes,Route } from 'react-router-dom'
import AddProduct from '../../Components/AddProduct/AddProduct'
import ListProduct from '../../Components/ListProduct/ListProduct'
import ListOrders from '../../Components/ListOrders/ListOrders'
import SalesStats from '../../Components/SalesStats/SalesStats'
import UsersList from '../../Components/UsersList/UsersList'
import AdminPromotions from '../../Components/Promotions/AdminPromotions'

const Admin = () => {
  return (
    <div className='admin'>
      <Sidebar />
      <Routes>
        <Route path='/addproduct' element={<AddProduct/>}/>
        <Route path='/listproduct' element={<ListProduct/>}/>
        <Route path='/listorders' element={<ListOrders/>}/>
        <Route path='/dashboard' element={<SalesStats/>}/>
        <Route path='/users' element={<UsersList/>}/>
        <Route path='/promotions' element={<AdminPromotions/>}/>
      </Routes>
    </div>
  )
}

export default Admin