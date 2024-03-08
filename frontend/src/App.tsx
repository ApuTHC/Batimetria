import { BrowserRouter, Routes, Route } from "react-router-dom";
import {PrivateRoute, AdminPrivateRoute} from "./components/PrivateRoute.tsx";

import 'bootstrap/dist/css/bootstrap.min.css';

import Layout from "./components/Layout.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import AdminPage from "./pages/AdminPage.tsx";
import UserProfilePage from "./pages/UserProfilePage.tsx";
import VisorPage from "./pages/VisorPage.tsx";

function App() {

  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<VisorPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />

                <Route element={<PrivateRoute />}>
                    <Route path="profile" element={<UserProfilePage />} />
                </Route>

                <Route path="admin" element={<AdminPrivateRoute />}>
                    <Route index element={<AdminPage />} />
                </Route>
            </Route>
        </Routes>
    </BrowserRouter>
  )
}

export default App
