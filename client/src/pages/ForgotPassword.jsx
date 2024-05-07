import React, { useState } from "react";
import { Oval } from "react-loader-spinner";
import { Link } from "react-router-dom";

function ForgotPassword() {
	const [userData, setUserData] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [showAlert, setShowAlert] = useState(false);

	const handleChange = e => {
		setUserData({
			...userData,
			[e.target.id]: e.target.value,
		});
	};

	const API_URL = import.meta.env.VITE_API_URL;

	const handleSubmit = async e => {
		e.preventDefault();
		setIsLoading(true);
		setErrorMessage("");
		const res = await fetch(`${API_URL}/api/auth/reset-password`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(userData),
		});
		const data = await res.json();
		if (data.ok) {
			setIsLoading(false);
			setShowAlert(true);
		} else {
			setErrorMessage(data.msg);
			setIsLoading(false);
		}
	};
	return (
		<div className="min-h-screen flex flex-col items-center justify-center w-full">
			{showAlert && (
				<div
					className="bg-blue-100 border-t border-b border-blue-500 text-blue-700 px-4 py-3 mb-5 max-w-sm"
					role="alert"
				>
					<p className="font-bold">Kindly note</p>
					<p className="text-sm">
						Please check your email <span className="font-semibold">{userData.email}</span> and follow the next steps to
						reset your password.
					</p>
					<button
						onClick={() => {
							setShowAlert(false);
						}}
						type="button"
						className="mt-3"
					>
						Ok
					</button>
				</div>
			)}
			<div className="bg-slate-800 shadow-md rounded-lg px-8 py-6 max-w-md">
				<h1 className="text-2xl text-white font-bold text-center mb-4 dark:text-gray-200">Reset Your Password</h1>
				{errorMessage && <p className="mb-3 p-2 bg-red-800 text-white text-sm opacity-75 rounded-lg">{errorMessage}</p>}
				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Email your email to receive reset link
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
					<div className="flex items-center justify-between mt-3 mb-3">
						<Link
							to="/login"
							className="text-xs text-white hover:outline-3 hover:ring-2 hover:ring-offset-2 hover:opacity-85"
						>
							Back to login
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
							type="submit"
							className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:opacity-85 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						>
							Send Reset Email
						</button>
					)}
				</form>
			</div>
		</div>
	);
}

export default ForgotPassword;
