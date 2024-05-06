import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { Link, useNavigate } from "react-router-dom";
import { FaShare } from "react-icons/fa6";
import { MdSkipNext, MdSkipPrevious } from "react-icons/md";

function Video() {
	const [url, setUrl] = useState("");
	const [video, setVideo] = useState(null);
	const [refresh, setRefresh] = useState(false);
	const [showPrev, setShowPrev] = useState(true);
	const [showNext, setShowNext] = useState(true);
	const [copied, setCopied] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isPrevLoading, setIsPrevLoading] = useState(false);
	const [isNextLoading, setIsNextLoading] = useState(false);
	const [showShareModal, setShowShareModal] = useState(false);

	const navigate = useNavigate();
	const params = useParams();
	const id = params.id;
	const API_URL = import.meta.env.VITE_API_URL;

	useEffect(() => {
		const getVideo = async () => {
			const res = await fetch(`${API_URL}/api/videos/${id}`);
			const data = await res.json();
			if (data.ok) {
				setIsPrevLoading(false);
				setIsNextLoading(false);
				setUrl(data.video.videoUrl);
				setVideo(data.video);
				setShowNext(data.video.nextVid !== null);
				setShowPrev(data.video.prevVid !== null);
				setIsLoading(false);
			}
		};
		getVideo();
	}, [refresh]);

	const handleNext = (e) => {
		setIsNextLoading(true);
		setRefresh(!refresh);
		navigate(`/video/${video.nextVid}`);
	};

	const handlePrev = (e) => {
		setIsPrevLoading(true);
		setRefresh(!refresh);
		navigate(`/video/${video.prevVid}`);
	};

	return (
		<div>
			<div className="max-w-2xl h-screen flex text-center p-5 mx-auto">
				{isLoading && (
					<div
						id="loading-overlay"
						className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-60"
					>
						<svg
							className="animate-spin h-8 w-8 text-white mr-3"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							></circle>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>

						<span className="text-white text-2xl font-bold">
							Loading video...
						</span>
					</div>
				)}

				<div className="w-[700] h-[400px] text-white flex flex-col gap-4 mx-auto">
					{video && (
						<video
							key={video._id}
							className="w-full sm:max-w-2xl max-w-screen-md max-h-3xl object-cover rounded-md"
							src={url}
							controls
							autoPlay
						/>
					)}
					<div className="flex justify-between">
						{video && showPrev && (
							<button
								type="button"
								onClick={handlePrev}
								className="rounded-xl bg-slate-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:outline-3 hover:ring-1 hover:ring-offset-1 hover:opacity-85"
							>
								{isPrevLoading ? (
									<p>Loading</p>
								) : (
									<div className="flex items-center gap-1">
										<MdSkipPrevious />
										Prev
									</div>
								)}
							</button>
						)}
						<div className="flex-grow"></div>
						{video && showNext && (
							<button
								type="button"
								onClick={handleNext}
								className="rounded-xl bg-slate-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:outline-3 hover:ring-1 hover:ring-offset-1 hover:opacity-85"
							>
								{isNextLoading ? (
									<p>Loading</p>
								) : (
									<div className="flex items-center gap-1">
										Next
										<MdSkipNext />
									</div>
								)}
							</button>
						)}
					</div>
					<div className="flex justify-between items-center mb-2">
						<div className="font-semibold text-lg text-left">
							{video && video.title}
						</div>
						<div
							onClick={() => {
								setShowShareModal(true);
							}}
							className="rounded-md transition-all flex items-center cursor-pointer gap-1 p-1 border"
						>
							Share
							<FaShare />
						</div>
					</div>

					<div className="flex items-center">
						<div className="flex-shrink-0 mr-3">
							<img
								className="h-10 w-10 rounded-full"
								src="https://via.placeholder.com/150"
								alt="Avatar"
							/>
						</div>
						<div className="text-sm">
							<p className="leading-none">
								{video && video.poster.username}
							</p>
						</div>
					</div>
					<p className="text-start pb-6">
						{video && video.description}
					</p>
				</div>
			</div>
			{showShareModal && (
				<div className="w-full fixed flex items-center justify-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
					<div className="bg-gray-700 mx-4 p-4 rounded-xl">
						<div className="flex justify-between items center border-b border-gray-200 py-3">
							<p className="text-xl font-bold text-white">
								Share Video Modal
							</p>
							<button
								onClick={() => {
									setShowShareModal(false);
								}}
								className="bg-gray-300 hover:bg-red-500 cursor-pointer font-sans text-black w-8 h-8 flex items-center justify-center rounded-full"
							>
								x
							</button>
						</div>

						<div className="my-4 text-white">
							<p className="text-sm">Copy video link</p>
							<div className="border-2 rounded-lg border-gray-500 flex justify-between items-center mt-4 py-2">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									className="fill-gray-200 ml-2"
								>
									<path d="M8.465 11.293c1.133-1.133 3.109-1.133 4.242 0l.707.707 1.414-1.414-.707-.707c-.943-.944-2.199-1.465-3.535-1.465s-2.592.521-3.535 1.465L4.929 12a5.008 5.008 0 0 0 0 7.071 4.983 4.983 0 0 0 3.535 1.462A4.982 4.982 0 0 0 12 19.071l.707-.707-1.414-1.414-.707.707a3.007 3.007 0 0 1-4.243 0 3.005 3.005 0 0 1 0-4.243l2.122-2.121z"></path>
									<path d="m12 4.929-.707.707 1.414 1.414.707-.707a3.007 3.007 0 0 1 4.243 0 3.005 3.005 0 0 1 0 4.243l-2.122 2.121c-1.133 1.133-3.109 1.133-4.242 0L10.586 12l-1.414 1.414.707.707c.943.944 2.199 1.465 3.535 1.465s2.592-.521 3.535-1.465L19.071 12a5.008 5.008 0 0 0 0-7.071 5.006 5.006 0 0 0-7.071 0z"></path>
								</svg>

								<input
									className="w-full outline-none bg-transparent"
									type="text"
									placeholder="link"
									value={window.location.href}
								/>

								<button
									onClick={() => {
										navigator.clipboard.writeText(
											window.location.href
										);
										setCopied(true);
										setTimeout(() => {
											setCopied(false);
										}, 3000);
									}}
									className="bg-white opacity-90 text-black rounded text-sm py-2 px-5 mr-2 hover:opacity-95"
								>
									{copied ? <p>copied</p> : <p>Copy</p>}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default Video;
