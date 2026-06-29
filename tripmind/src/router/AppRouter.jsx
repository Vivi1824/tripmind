import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import PlaceDetail from "../pages/PlaceDetail";
import Profile from "../pages/Profile";
import Results from "../pages/Results";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
          <Route path="/place/:id" element={<PlaceDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}