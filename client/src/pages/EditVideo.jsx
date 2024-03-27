import React, { useState, useEffect } from "react";
import { RiChatDeleteFill } from "react-icons/ri";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams } from "react-router-dom";
import { Oval } from "react-loader-spinner";

function EditVideo() {
  const [title, setTitle] = useState("");
  const [description, setDesciption] = useState("");
  const [video, setVideo] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadError, setUploadError] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);

  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    const getVideo = async () => {
      const res = await fetch(`/api/videos/${id}`);
      const data = await res.json();
      if (data.ok) {
        setTitle(data.video.title);
        setDesciption(data.video.description);
        setVideoUrl(data.video.videoUrl);
      }
    };

    getVideo();
  }, []);

  const handleVideoUpload = (video) => {
    setIsUploadLoading(true);
    if (!video) return;

    const storage = getStorage(app);
    const fileName = new Date().getTime() + "__" + video.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, video);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadPercent(Math.round(progress));
      },
      (error) => {
        setUploadError(true);
        console.log(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadRUL) => {
          setVideoUrl(downloadRUL);
          setIsUploadLoading(false);
        });
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaveLoading(true);
    const res = await fetch(`/api/videos/edit/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        videoUrl,
      }),
    });

    const data = await res.json();
    if (data.ok) {
      console.log(data);
      setIsSaveLoading(false);
      toast("Video Successfully Editted!");
      setInterval(() => {
        navigate("/");
      }, 3000);
    } else {
      console.log(data);
    }
  };

  return (
    <div className="w-full flex mt-12 px-6 items-center justify-center text-white">
      <ToastContainer />
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-6 sm:gap-10"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Title</label>
            <input
              placeholder="Enter video title"
              className="text-black p-2 rounded-xl shadow-sm bg-gray-300 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              type="text"
              required
              value={title}
              onChange={(e) => {
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
              value={description}
              onChange={(e) => {
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
                onChange={(e) => {
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
            {uploadPercent !== 0 && uploadPercent < 100 && (
              <p>Uploading {uploadPercent}%</p>
            )}
            {uploadPercent == 100 && (
              <p className="text-green-500">Upload successful!</p>
            )}
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

export default EditVideo;
