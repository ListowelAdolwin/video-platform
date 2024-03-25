import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Video from "../components/Video";
import { useSelector } from "react-redux";

export default function Home() {
  const [videos, setVideos] = useState([]);

  const user = useSelector((state) => state.user.currentUser)
  useEffect(() => {
    const getVideos = async () => {
      try {
        const res = await fetch("/api/videos");
        const data = await res.json();
        setVideos(data.videos);
      } catch (error) {
        console.log(error);
      }
    };
    getVideos();
  }, []);

  return (
    <div>
      <div className="px-2 my-2 sm:px-10 sm:my-10">
        {videos && videos.length > 0 && (
          <div className="grid w-full sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Video video={video} key={video._id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
