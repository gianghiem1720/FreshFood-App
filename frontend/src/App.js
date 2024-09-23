import './App.css';
import Navbar from './Components/Navbar/Navbar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Shop from './Pages/Shop';
import ShopCategory from './Pages/ShopCategory';
import ProductDisplay from './Components/ProductDisplay/ProductDisplay';
import Product from './Pages/Product';
import Cart from './Pages/Cart';
import LoginSignup from './Pages/LoginSignup';
import Footer from './Components/Footer/Footer';
import men_banner from './Components/Assets/seafood_banner.avif';
import women_banner from './Components/Assets/meat_banner.webp';
import kid_banner from './Components/Assets/freshfood_banner.webp';
import Checkout from './Components/Checkout/Checkout';
import Profile from './Components/Profile/Profile';
import MyOrders from './Components/MyOrders/MyOrders';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path='/' element={<Shop />} />
          <Route path='/seafood' element={<ShopCategory banner={men_banner} category={2} />} />
          <Route path='/meat' element={<ShopCategory banner={women_banner} category={1} />} />
          <Route path='/vegetable' element={<ShopCategory banner={kid_banner} category={3} />} />
          <Route path="/category/:categoryId" element={<ShopCategory/>} />
          <Route path="/product/:productId" element={<ProductDisplay/>} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/login' element={<LoginSignup />} />
          <Route path="/checkout" element={<Checkout/>}/>
          <Route path='/profile' element={<Profile/>}/>
          <Route path='/orders' element={<MyOrders/>}/>
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
