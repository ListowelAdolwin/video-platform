import React, { useState } from "react";
import { FaEdit, FaPlay } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Oval } from "react-loader-spinner";

function Video({ video, removeVideo }) {
	const { currentUser } = useSelector(state => state.user);
	const [isdeleteLoading, setIsDeleteLoading] = useState(false);

	const API_URL = import.meta.env.VITE_API_URL;

	const deleteVideo = async id => {
		setIsDeleteLoading(true);
		const res = await fetch(`${API_URL}/api/videos/delete/${id}`, {
			headers: {
				Authorization: `Bearer ${currentUser.accessToken}`,
			},
		});
		const data = await res.json();
		if (data.ok) {
			setIsDeleteLoading(false);
			removeVideo(id);
		}
	};

	return (
		<div className="relative flex flex-col shadow-md rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 max-w-sm">
			<Link to={`/video/${video._id}`} className="z-20 absolute h-full w-full top-0 left-0 ">
				&nbsp;
			</Link>
			<div className="h-auto overflow-hidden">
				<div className="h-44 overflow-hidden relative">
					<video
						muted
						//poster={logo}
					>
						<source src={video.videoUrl} type="video/mp4" />
					</video>
				</div>
			</div>
			<div className="bg-slate-800 py-4 px-3">
				<p className="text-xs text-gray-100 line-clamp-2">{video.description}</p>
				<p className="truncate text-white">{video.title}</p>
				<div className="relative z-40 flex justify-start gap-5 items-center mt-2">
					<div className="z-30 group relative flex justify-center">
						<Link to={`/video/${video._id}`} className="bg-gray-700 p-2 rounded-full text-white hover:text-blue-500">
							<FaPlay />
						</Link>
						<span className="z-30 text-bold text-center absolute left-10 scale-0 transition-all rounded bg-gray-700 p-2 text-xs text-white group-hover:scale-100 w-12">
							Play
						</span>
					</div>
					{currentUser?.isAdmin && (
						<div className="z-20 group relative flex justify-center">
							<Link to={`/edit/${video._id}`} className="bg-gray-700 p-2 rounded-full text-white hover:text-blue-500">
								<FaEdit />
							</Link>
							<span className="z-10 text-bold text-center absolute left-10 scale-0 transition-all rounded bg-gray-700 p-2 text-xs text-white group-hover:scale-100 w-24">
								Edit video
							</span>
						</div>
					)}
					{currentUser?.isAdmin && (
						<div>
							{isdeleteLoading ? (
								<div
									style={{
										margin: "auto",
									}}
								>
									<Oval
										height="30"
										width="30"
										color="#ef4444"
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
										className="bg-gray-700 p-2 rounded-full text-red-500 hover:text-white hover:bg-red-500"
										onClick={() => {
											deleteVideo(video._id);
										}}
									>
										<MdDelete />
									</button>
									<span className="text-bold text-center absolute left-10 scale-0 transition-all rounded bg-gray-700 p-2 text-xs text-white group-hover:scale-100 w-24">
										Delete video
									</span>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default Video;
