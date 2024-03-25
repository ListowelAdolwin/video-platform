import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Header from "./components/Header";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Video from "./pages/Video";
import UploadVideo from "./pages/UploadVideo";
import PrivateRoute from "./components/PrivateRoute";
import EditVideo from "./pages/EditVideo";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/video/:id" element={<Video />} />
          <Route element={<PrivateRoute />}>
            <Route path="/upload" element={<UploadVideo />} />
            <Route path="/edit/:id" element={<EditVideo />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
