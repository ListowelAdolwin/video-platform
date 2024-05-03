import React, { useState } from "react";
import { Oval } from "react-loader-spinner";
import { Link, useNavigate } from "react-router-dom";

function Register() {
	const [userData, setUserData] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessages, setErrorMessages] = useState("");

	const navigate = useNavigate();
	const API_URL = import.meta.env.VITE_API_URL;

	const handleChange = (e) => {
		setUserData({
			...userData,
			[e.target.id]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		setIsLoading(true);
		setErrorMessages("");
		e.preventDefault();
		const res = await fetch(`${API_URL}/api/auth/register`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(userData),
		});
		const data = await res.json();
		console.log("Response:", data);
		if (res.ok) {
			setIsLoading(false);
			navigate(`/check-email/${data.user.id}`);
		} else {
			setErrorMessages(data.msg);
			setIsLoading(false);
		}
	};

	return (
		<div>
			<div className="min-h-screen flex items-center justify-center w-full">
				<div className=" bg-slate-800 shadow-md rounded-lg px-8 py-6 max-w-sm">
					<h1 className="text-2xl font-bold text-center mb-4 dark:text-gray-200">
						Register
					</h1>
					{errorMessages && (
						<p className="mb-3 p-2 bg-red-800 text-white text-sm opacity-75 rounded-lg">
							{errorMessages}
						</p>
					)}
					<form onSubmit={handleSubmit}>
						<div className="mb-4">
							<label
								for="username"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
							>
								Username
							</label>
							<input
								type="text"
								id="username"
								className="shadow-sm bg-gray-300 rounded-md w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
								placeholder="Enter username"
								required
								onChange={handleChange}
							/>
						</div>
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
								onChange={handleChange}
							/>
						</div>
						<div className="mb-4">
							<label
								for="password"
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
						{isLoading ? (
							<div className="mt-4">
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
								className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:opacity-85"
							>
								Register
							</button>
						)}
						<div className="text-end">
							<Link
								to="/login"
								className="text-xs text-white  hover:outline-3 hover:ring-2 hover:ring-offset-2 hover:ring-gray-500"
							>
								Login
							</Link>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

export default Register;
