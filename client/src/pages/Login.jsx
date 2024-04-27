import React, { useState } from "react";
import { Oval } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {useDispatch} from "react-redux"
import { loginUser } from "../redux/features/user/userSlice";

function Login() {
  const [userData, setUserData] = useState({});
  const[isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const dispatch = useDispatch()
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true)
    setErrorMessage("")
    const res = await fetch("https://video-platform-api.onrender.com/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    console.log(res)
    const data = await res.json();
    console.log(data);
    if (data.ok) {
      setIsLoading(false)
      dispatch(loginUser(data.user))
      navigate("/");
    } else {
      setErrorMessage(data.msg)
      setIsLoading(false)
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center w-full">
      <div className="bg-slate-800 shadow-md rounded-lg px-8 py-6 max-w-md">
        <h1 className="text-2xl text-white font-bold text-center mb-4 dark:text-gray-200">
          Welcome Back!
        </h1>
        {errorMessage && (
          <p className="mb-3 p-2 bg-red-800 text-white text-sm opacity-75 rounded-lg">
            {errorMessage}
          </p>
        )}
        <form action="#">
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="shadow-sm bg-gray-300 rounded-md w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter email"
              required
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="shadow-sm bg-gray-300  rounded-md w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter password"
              required
              onChange={handleChange}
            />
          </div>
          <Link
            to="/reset-password"
            className="text-xs text-white hover:outline-3 hover:ring-2 hover:ring-offset-2 hover:ring-gray-500"
          >
            Forgot Password?
          </Link>
          <div className="text-end mt-3 mb-3">
            <Link
              to="/register"
              className="text-xs text-white hover:outline-3 hover:ring-2 hover:ring-offset-2 hover:opacity-85"
            >
              Create Account
            </Link>
          </div>
          {isLoading ? (
            <div
              style={{
                margin: "auto",
              }}
            >
              <Oval
                height="30"
                width="30"
                color="#383B53"
                ariaLabel="tail-spin-loading"
                radius="2"
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
              />
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:opacity-85 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Login
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;
