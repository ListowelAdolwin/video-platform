import React from "react";
import { FaExternalLinkAlt, FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

function Video({ video }) {
  const { currentUser } = useSelector((state) => state.user);

  const deleteVideo = async (id) => {
    const res = await fetch(`/api/videos/delete/${id}`);
    const data = res.json();
    if (data.ok) {
      console.log("Delete successful: ");
    }
  };

  return (
    <div className="relative flex flex-col shadow-md rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 max-w-sm">
      <Link
        to={`/video/${video._id}`}
        className="z-20 absolute h-full w-full top-0 left-0 "
      >
        &nbsp;
      </Link>
      <div className="h-auto overflow-hidden">
        <div className="h-44 overflow-hidden relative">
          <video src={video.videoUrl} />
        </div>
      </div>
      <div className="bg-slate-600 py-4 px-3">
        <p className="text-xs text-gray-100 line-clamp-2">
          {video.description}
        </p>
        <p className="truncate text-white">{video.title}</p>
        <div className="relative z-40 flex justify-between items-center mt-2">
          <Link
            to={`/video/${video._id}`}
            className="bg-gray-700 p-2 rounded-full text-white hover:text-blue-500"
          >
            <FaExternalLinkAlt />
          </Link>
          {currentUser?.isAdmin && (
            <Link
              to={`/video/${video._id}`}
              className="bg-gray-700 p-2 rounded-full text-white hover:text-blue-500"
            >
              <FaEdit />
            </Link>
          )}
          {currentUser?.isAdmin && (
            <button
              type="button"
              className="bg-gray-700 p-2 rounded-full text-red-500 hover:text-white hover:bg-red-500"
              onClick={() => {
                deleteVideo(video._id);
              }}
            >
              <MdDelete />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Video;
