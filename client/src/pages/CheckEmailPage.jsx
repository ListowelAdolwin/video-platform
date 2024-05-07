import React, { useState } from "react";
import { Oval } from "react-loader-spinner";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function CheckEmailPage() {
	const [isLoading, setIsloading] = useState(false);

	const params = useParams();
	const id = params.id;

	const API_URL = import.meta.env.VITE_API_URL;

	const handleEmailResend = async () => {
		setIsloading(true);
		const res = await fetch(`${API_URL}/api/auth/resend-email/${id}`);
		const data = await res.json();
		if (data.ok) {
			setIsloading(false);
			toast("Email Resent");
		} else {
			setIsloading(false);
		}
	};
	return (
		<div className="text-white p-5 sm:p-10 md:px-24">
			<ToastContainer />
			An email has been sent to your account pending verification. Please Check your email and follow the steps to
			verify.
			<br />
			<br />
			Thank you
			<br />
			<br />
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
					type="button"
					className="mt-3 rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold text-white shadow-sm"
					onClick={handleEmailResend}
				>
					Resend email
				</button>
			)}
		</div>
	);
}

export default CheckEmailPage;
