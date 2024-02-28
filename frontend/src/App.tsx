import { BrowserRouter, Routes, Route } from "react-router-dom";
import {PrivateRoute, AdminPrivateRoute} from "./components/PrivateRoute.tsx";
import Layout from "./components/Layout.tsx";
import HomePage from "./pages/HomePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import AdminPage from "./pages/AdminPage.tsx";
import AddProductPage from "./pages/AddProductPage.tsx";
import EditProductPage from "./pages/EditProductPage.tsx";
import SoloProductPage from "./pages/SoloProductPage.tsx";
import CategoryPage from "./pages/CategoryPage.tsx";
import SearchByCatePage from "./pages/SearchByCatePage.tsx";
import CartPage from "./pages/CartPage.tsx";
import UserProfilePage from "./pages/UserProfilePage.tsx";
import SoloOrderPage from "./pages/SoloOrderPage.tsx";
import VisorPage from "./pages/VisorPage.tsx";

function App() {

  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="cate" element={<CategoryPage />} />
                <Route path="cate/:cate" element={<SearchByCatePage />} />
                <Route path="product/:slug" element={<SoloProductPage />} />
                <Route path="visor" element={<VisorPage />} />

                <Route element={<PrivateRoute />}>
                    <Route path="cart" element={<CartPage />} />
                    <Route path="profile" element={<UserProfilePage />} />
                    <Route path="order/:id" element={<SoloOrderPage />} />
                </Route>

                <Route path="admin" element={<AdminPrivateRoute />}>
                    <Route index element={<AdminPage />} />
                    <Route path="add" element={<AddProductPage />} />
                    <Route path="edit/:id" element={<EditProductPage />} />
                </Route>
            </Route>
        </Routes>
    </BrowserRouter>
  )
}

export default App
