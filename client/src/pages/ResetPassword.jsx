import React, { useState, useEffect } from "react";
import { Oval } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { VscError } from "react-icons/vsc";
import { GiCheckMark } from "react-icons/gi";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState("");
  const [password1, setPassword1] = useState(" ");
  const [password2, setPassword2] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  const navigate = useNavigate();
  const params = useParams();
  const token = params.token;
  console.log("P1: ", password1);
  console.log("P2: ", password2);
  console.log(passwordsMatch);

  useEffect(() => {
    setPasswordsMatch(password1 == password2);
  }, [password1, password2]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessages("");

    const res = await fetch(`https://video-platform-api.onrender.com/api/auth/reset-password/${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password: password1,
      }),
    });
    const data = await res.json();
    console.log("Response:", data);
    if (data.ok) {
      setIsLoading(false);
      navigate("/login");
    } else {
      setErrorMessages(data.msg);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="min-h-screen flex items-center justify-center w-full">
        <div className="bg-slate-800 shadow-md rounded-lg px-8 py-6 max-w-sm">
          <h1 className="text-2xl font-bold text-center mb-4 dark:text-gray-200">
            Reset Password
          </h1>
          {errorMessages && (
            <p className="mb-3 p-2 bg-red-800 text-white text-sm opacity-75 rounded-lg">
              {errorMessages}
            </p>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                for="email"
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  setIsLoading(false);
                }}
              />
            </div>
            <div className="mb-4">
              <label
                for="password1"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password1"
                className="shadow-sm bg-gray-300  rounded-md w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter password"
                required
                onChange={(e) => {
                  setPassword1(e.target.value);
                  setIsLoading(false);
                }}
              />
            </div>
            <div className="mb-1">
              <label
                for="password2"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="password2"
                className="shadow-sm bg-gray-300  rounded-md w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter password"
                required
                onChange={(e) => {
                  setPassword2(e.target.value);
                  setIsLoading(false);
                }}
              />
            </div>
            <div className="mb-3 font-bold">
              {passwordsMatch ? <GiCheckMark /> : <VscError />}
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
                type="submit"
                className="w-full text-white items-center justify-center rounded-xl bg-gray-700 px-3 py-2 text-sm font-semibold shadow-sm transition-all duration-150 hover:opacity-95"
              >
                Reset Password
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
