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

  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    const getVideo = async () => {
      const res = await fetch(`https://video-platform-api.onrender.com/api/videos/${id}`);
      const data = await res.json();
      if (data.ok) {
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
    setRefresh(!refresh);
    navigate(`/video/${video.nextVid}`);
  };

  const handlePrev = (e) => {
    setRefresh(!refresh);
    navigate(`/video/${video.prevVid}`);
  };

  return (
    <div className="max-w-2xl h-screen flex text-center p-5 mx-auto">
      {isLoading && (
        <div
          id="loading-overlay"
          class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-60"
        >
          <svg
            class="animate-spin h-8 w-8 text-white mr-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>

          <span class="text-white text-2xl font-bold">Loading video...</span>
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
              className="rounded-xl bg-slate-600 px-3 py-2 text-sm font-semibold text-white shadow-sm"
            >
              <div className="flex items-center gap-1">
                <MdSkipPrevious />
                Prev
              </div>
            </button>
          )}
          <div className="flex-grow"></div>
          {video && showNext && (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-xl bg-slate-600 px-3 py-2 text-sm font-semibold text-white shadow-sm"
            >
              <div className="flex items-center gap-1">
                Next
                <MdSkipNext />
              </div>
            </button>
          )}
        </div>
        <div className="relative flex justify-between items-center mb-2">
          <div className="font-semibold text-lg text-left">
            {video && video.title}
          </div>
          <div
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => {
                setCopied(false);
              }, 2000);
            }}
            className="flex items-center cursor-pointer gap-1 p-1 border"
          >
            Share
            <FaShare />
          </div>
          {copied && (
            <p className="absolute top-[10%] right-[20%] z-10 rounded-md bg-gray-600 p-2">
              Link copied!
            </p>
          )}
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
            <p className="leading-none">{video && video.poster.username}</p>
          </div>
        </div>
        <p className="text-start pb-6">{video && video.description}</p>
      </div>
    </div>
  );
}

export default Video;
