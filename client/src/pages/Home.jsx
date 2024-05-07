import { useEffect, useState } from "react";
import Video from "../components/Video";

export default function Home() {
	const [videos, setVideos] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showMore, setShowMore] = useState(false);

	const API_URL = import.meta.env.VITE_API_URL;

	useEffect(() => {
		const getVideos = async () => {
			setShowMore(false);
			try {
				const res = await fetch(`${API_URL}/api/videos/?limit=9`);
				const data = await res.json();
				setShowMore(data.videos.length > 8);
				setVideos(data.videos);
				setIsLoading(false);
			} catch (error) {
				console.log("Error occurred in the videos fetch");
				console.log(error);
			}
		};
		getVideos();
	}, []);

	const removeDeletedVideo = videoId => {
		setVideos(videos.filter(vid => vid._id !== videoId));
	};

	const handleShowMore = async () => {
		setShowMore(false);
		const startIndex = videos.length;
		try {
			const res = await fetch(`${API_URL}/api/videos/?limit=9&&startIndex=${startIndex}`);
			const data = await res.json();
			if (data.ok) {
				setVideos([...videos, ...data.videos]);
				setShowMore(data.videos.length > 8);
			}
		} catch (error) {
			console.log("Error occurred in the videos fetch");
			console.log(error);
		}
	};

	return (
		<div>
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
						<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>

					<span className="text-white text-2xl font-bold">Loading videos...</span>
				</div>
			)}
			<div className="px-2 my-2 sm:px-10 sm:my-10">
				{videos && videos.length > 0 && (
					<div className="grid w-full sm:grid-cols-2 xl:grid-cols-3 gap-6">
						{videos.map(video => (
							<Video video={video} removeVideo={removeDeletedVideo} key={video._id} />
						))}
					</div>
				)}
				{showMore && (
					<button
						onClick={handleShowMore}
						className="mt-5 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-2 px-4 rounded inline-flex items-center"
					>
						<span>Show more videos</span>
					</button>
				)}
			</div>
		</div>
	);
}
