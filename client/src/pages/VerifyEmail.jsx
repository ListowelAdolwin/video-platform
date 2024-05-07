import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function VerifyEmail() {
	const [showAlert, setShowAlert] = useState(false);

	const navigate = useNavigate();
	const params = useParams();
	const token = params.token;

	const API_URL = import.meta.env.VITE_API_URL;

	useEffect(() => {
		const verifyEmail = async () => {
			const res = await fetch(`${API_URL}/api/auth/verify-email/${token}`);
			const data = await res.json();
			if (data.ok) {
				setShowAlert(true);
			} else {
				alert("Sorry, the token has expired");
			}
		};

		verifyEmail();
	}, []);

	return (
		<div className="flex justify-center items-center pt-5">
			<ToastContainer />
			{showAlert && (
				<div
					className="bg-blue-100 border-t border-b border-blue-500 text-blue-700 px-4 py-3 mb-5 max-w-sm"
					role="alert"
				>
					<p className="font-bold">Email verified!</p>
					<p className="text-sm">
						Your email has been successfully verified. <br />
						Proceed to login
					</p>
					<button
						onClick={() => {
							navigate("/login");
						}}
						type="button"
						className="mt-3"
					>
						Ok
					</button>
				</div>
			)}
		</div>
	);
}

export default VerifyEmail;
