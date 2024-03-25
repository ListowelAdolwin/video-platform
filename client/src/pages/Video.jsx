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

  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    const getVideo = async () => {
      const res = await fetch(`/api/videos/${id}`);
      const data = await res.json();
      if (data.ok) {
        setUrl(data.video.videoUrl);
        setVideo(data.video);
        setShowNext(data.video.nextVid !== null);
        setShowPrev(data.video.prevVid !== null);
      }
    };
    getVideo();
  }, [refresh]);

  const handleNext = (e) => {
    e.preventDefault();
    setRefresh(!refresh);
    navigate(`/video/${video.nextVid}`);
  };

  const handlePrev = (e) => {
    e.preventDefault();
    setRefresh(!refresh);
    navigate(`/video/${video.prevVid}`);
  };


  return (
    <div className="max-w-5xl h-screen flex text-center p-5 mx-auto">
      <div className="w-[700] h-[400px] text-white flex flex-col gap-4 mx-auto">
        {video && (
          <video
            key={video._id}
            className="w-full h-full object-cover rounded-md"
            src={url}
            controls
            autoPlay
          />
        )}
        <div className="flex justify-between">
          {video && showPrev && (
            <button
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
          <div className="font-semibold text-lg">{video && video.title}</div>
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
            <p className="leading-none">Video Uploader</p>
          </div>
        </div>
        <p className="text-start pb-6">{video && video.description}</p>
      </div>
    </div>
  );
}

export default Video;
