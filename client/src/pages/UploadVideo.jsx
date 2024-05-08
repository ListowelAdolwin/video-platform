import React, { useState } from "react";
import { RiChatDeleteFill } from "react-icons/ri";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../firebase.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Oval } from "react-loader-spinner";
import { loginUser, logoutUser } from "../redux/features/user/userSlice.jsx";

function UploadVideo() {
	const [title, setTitle] = useState("");
	const [description, setDesciption] = useState("");
	const [video, setVideo] = useState(null);
	const [videoUrl, setVideoUrl] = useState("");
	const [uploadPercent, setUploadPercent] = useState(0);
	const [uploadError, setUploadError] = useState(false);
	const [isSaveLoading, setIsSaveLoading] = useState(false);
	const [isUploadLoading, setIsUploadLoading] = useState(false);

	const navigate = useNavigate();
	const { currentUser } = useSelector(state => state.user);
	const dispatch = useDispatch();
	const API_URL = import.meta.env.VITE_API_URL;

	const handleVideoUpload = video => {
		setIsUploadLoading(true);

		const storage = getStorage(app);
		const fileName = new Date().getTime() + "__" + video.name;
		const storageRef = ref(storage, fileName);
		const uploadTask = uploadBytesResumable(storageRef, video);

		uploadTask.on(
			"state_changed",
			snapshot => {
				const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				setUploadPercent(Math.round(progress));
			},
			error => {
				setUploadError(true);
				console.log("Error while uploading: ", error);
			},
			() => {
				getDownloadURL(uploadTask.snapshot.ref).then(downloadRUL => {
					setVideoUrl(downloadRUL);
					setIsUploadLoading(false);
				});
			}
		);
	};

	const sendSaveVideoRequest = async accessToken => {
		const res = await fetch(`${API_URL}/api/videos/save`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${accessToken}`,
			},
			body: JSON.stringify({
				title,
				description,
				videoUrl,
				poster: currentUser,
			}),
		});
		return res;
	};

	const handleSubmit = async e => {
		e.preventDefault();
		setIsSaveLoading(true);
		setIsUploadLoading(true);

		const res = await sendSaveVideoRequest(currentUser.accessToken);
		if (res.status === 401) {
			const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
				headers: {
					Authorization: `Bearer ${currentUser.refreshToken}`,
				},
			});

			const refreshData = await refreshRes.json();
			if (refreshData.ok) {
				const updatedUser = {
					...currentUser,
					accessToken: refreshData.accessToken,
					refreshToken: refreshData.refreshToken,
				};
				dispatch(loginUser(updatedUser));
			} else {
				dispatch(logoutUser());
			}

			const newRes = await sendSaveVideoRequest(refreshData.accessToken);
			const data = await newRes.json();
			if (data.ok) {
				setIsSaveLoading(false);
				toast("Video Successfully Uploaded!");
				navigate("/");
			} else {
				setIsSaveLoading(false);
				console.log(data);
				toast.error("Couldn't upload video! Please retry. Refreshing the page might help");
			}
		}

		const data = await res.json();
		if (data.ok) {
			setIsSaveLoading(false);
			toast("Video Successfully Uploaded!");
			navigate("/");
		} else {
			setIsSaveLoading(false);
			console.log(data);
			toast.error("Couldn't upload video! Please retry. Refreshing the page might help");
		}
	};

	return (
		<div className="w-full flex mt-12 px-6 items-center justify-center text-white">
			<ToastContainer />
			<form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-6 sm:gap-10">
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<label className="font-semibold">Title</label>
						<input
							placeholder="Enter video title"
							className="text-black p-2 rounded-xl shadow-sm bg-gray-300 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
							type="text"
							required
							onChange={e => {
								setTitle(e.target.value);
							}}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<label className="font-semibold">Description</label>
						<textarea
							placeholder="Enter video description"
							className="text-black p-2 rounded-xl shadow-sm bg-gray-300 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
							name=""
							id=""
							cols="10"
							rows="4"
							required
							onChange={e => {
								setDesciption(e.target.value);
							}}
						/>
					</div>
				</div>
				<div>
					<div className="flex flex-col gap-4">
						<label className="font-semibold"> Select Video to upload</label>
						<div className="flex items-center">
							<input
								className=""
								type="file"
								name=""
								id=""
								accept="video/.*"
								//required
								onChange={e => {
									setVideo(e.target.files[0]);
								}}
							/>
						</div>
						<div className="relative">
							{video && (
								<div>
									<video className="rounded-lg" width="300" controls>
										<source src={URL.createObjectURL(video)} />
									</video>
									<button
										type="button"
										onClick={() => setVideo(null)}
										className="absolute top-0 right-0 p-2 text-red-700 rounded-full bg-gray-300"
									>
										<RiChatDeleteFill />
									</button>
									{isUploadLoading ? (
										<div
											style={{
												margin: "auto",
											}}
										>
											<Oval
												height="30"
												width="30"
												color="#fff"
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
											onClick={() => {
												handleVideoUpload(video);
											}}
										>
											Upload
										</button>
									)}
								</div>
							)}{" "}
						</div>
					</div>
					<div className="mt-2">
						{uploadPercent !== 0 && uploadPercent < 100 && <p>Uploading {uploadPercent}%</p>}
						{uploadPercent == 100 && <p className="text-green-500">Upload successful!</p>}
						{uploadError && <p className="text-red-500">Error while uploading video</p>}
					</div>
					{isSaveLoading ? (
						<div
							style={{
								margin: "auto",
							}}
						>
							<Oval
								height="30"
								width="30"
								color="#fff"
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
							className="w-full mt-3 rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold text-white shadow-sm"
						>
							Save video
						</button>
					)}
				</div>
			</form>
		</div>
	);
}

export default UploadVideo;
