import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo_final.png";
import { useSelector } from "react-redux";
import { IoIosLogOut } from "react-icons/io";
import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/features/user/userSlice";
import { Oval } from "react-loader-spinner";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function HeaderNew() {
	const [isLoading, setIsLoading] = useState(false);
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const API_URL = import.meta.env.VITE_API_URL;

	const handleLogout = async () => {
		setIsLoading(true);
		const res = await fetch(`${API_URL}/api/auth/logout`);
		const data = await res.json();
		if (data.ok) {
			setIsLoading(false);
			dispatch(logoutUser());
			toast("Successfully Logged Out!");
			navigate("/");
		}
	};

	const { currentUser } = useSelector(state => state.user);

	return (
		<header className="mx-auto  mt-2 w-full max-w-screen-md bg-slate-700 py-3 shadow backdrop-blur-lg md:top-6 md:rounded-3xl lg:max-w-screen-lg">
			<ToastContainer />
			<div className="px-4">
				<div className="flex items-center justify-between">
					<Link to="/">
						<img className="rounded-lg h-10 w-16" src={logo} alt="" />
					</Link>

					{currentUser ? (
						<div className="flex items-center gap-1">
							<span className="text-white items-center justify-center rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold shadow-sm transition-all duration-150 hover:opacity-95">
								Hi, {currentUser.username}
							</span>
							{currentUser?.isAdmin && (
								<div className="group relative flex justify-center">
									<Link
										className="text-white items-center justify-center rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold shadow-sm transition-all duration-150 hover:outline-3 hover:ring-1 hover:ring-offset-1 hover:opacity-85"
										to="/upload"
									>
										Upload
									</Link>
									<span className="text-bold text-center absolute top-10 scale-0 transition-all rounded bg-gray-700 p-2 text-xs text-white group-hover:scale-100 w-24">
										Upload video
									</span>
								</div>
							)}
							{isLoading ? (
								<div className="">
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
								<div className="group relative flex justify-center">
									<button
										type="button"
										onClick={handleLogout}
										className="text-white items-center justify-center rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold shadow-sm transition-all duration-150 hover:opacity-95"
									>
										<IoIosLogOut />
									</button>
									<span className="text-bold text-center absolute top-10 scale-0 transition-all rounded bg-gray-700 p-2 text-xs text-white group-hover:scale-100 w-auto">
										Logout
									</span>
								</div>
							)}
						</div>
					) : (
						<div className="flex items-center justify-end gap-3">
							<div className="group relative flex justify-center">
								<Link
									className="text-white items-center justify-center rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold shadow-sm transition-all duration-150 hover:outline-3 hover:ring-1 hover:ring-offset-1 hover:opacity-85"
									to="/login"
								>
									Sign in
								</Link>
								<span className="text-bold text-center absolute top-10 scale-0 transition-all rounded bg-gray-700 p-2 text-xs text-white group-hover:scale-100 w-16">
									Sign in
								</span>
							</div>

							<div className="group relative flex justify-center">
								<Link
									className="inline-flex items-center justify-center rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:outline-3 hover:ring-1 hover:ring-offset-1 hover:opacity-85"
									to="/register"
								>
									Sign up
								</Link>
								<span className="text-bold text-center absolute top-10 scale-0 transition-all rounded bg-gray-700 p-2 text-xs text-white group-hover:scale-100 w-16">
									Sign up
								</span>
							</div>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}

export default HeaderNew;
