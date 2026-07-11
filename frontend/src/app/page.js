"use client";

import { useState, useRef, useEffect } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const SAMPLE_IMAGES = [
  {
    label: "Try Sample 1",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600",
  },
  {
    label: "Try Sample 2",
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600",
  },
];

export default function Home() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  const processFile = (selected) => {
    if (!selected) return;

    const isImage = selected.type.startsWith("image/");
    const isVideo = selected.type.startsWith("video/");

    if (!isImage && !isVideo) {
      showToast("Please upload an image or video file.");
      return;
    }

    if (selected.size > MAX_FILE_SIZE) {
      showToast("File is too large. Max size is 10MB.");
      return;
    }

    setFile(selected);
    setResult(null);
    setError(null);
    setPreview(URL.createObjectURL(selected));
  };

  const handleFileChange = (e) => {
    processFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSampleClick = async (sample) => {
    try {
      const response = await fetch(sample.url);
      const blob = await response.blob();
      const sampleFile = new File([blob], "sample.jpg", { type: blob.type });
      processFile(sampleFile);
    } catch (err) {
      showToast("Couldn't load sample image. Try uploading your own.");
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

      const response = await fetch(`${apiUrl}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Server returned an error. Please try again.");
      }

      const data = await response.json();
      setResult(data);

      setHistory((prev) =>
        [
          {
            name: file.name,
            prediction: data.prediction,
            confidence: data.confidence,
            type: file.type.startsWith("video/") ? "video" : "image",
          },
          ...prev,
        ].slice(0, 5)
      );
    } catch (err) {
      setError(err.message);
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  const bg = darkMode ? "bg-gray-900" : "bg-gray-50";
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-gray-100" : "text-gray-800";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-300";

  return (
    <main className={`flex min-h-screen flex-col items-center justify-center ${bg} p-6 transition-colors`}>
      <div className={`w-full max-w-md ${cardBg} rounded-2xl shadow-md p-8 transition-colors`}>

        <div className="flex justify-between items-center mb-2">
          <h1 className={`text-2xl font-bold ${textPrimary}`}>Deepfake Detector</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`text-xs px-3 py-1 rounded-full border ${borderColor} ${textSecondary} cursor-pointer`}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        <p className={`text-sm text-center ${textSecondary} mb-4`}>
          Upload a face image/video to check if it's real or AI-generated.
        </p>

        <div className="flex gap-2 justify-center mb-6">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.label}
              onClick={() => handleSampleClick(sample)}
              className={`text-xs px-3 py-1.5 rounded-full border ${borderColor} ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer`}
            >
              {sample.label}
            </button>
          ))}
        </div>

        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition ${
            isDragging
              ? "border-gray-900 bg-gray-100"
              : `${borderColor} hover:border-gray-400`
          }`}
        >
          <span className={`text-sm ${textSecondary} mb-2 text-center`}>
            {file ? file.name : "Click or drag a file here"}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {preview &&
          (file?.type.startsWith("video/") ? (
            <video src={preview} controls className="mt-4 w-full h-48 object-cover rounded-xl" />
          ) : (
            <img src={preview} alt="Preview" className="mt-4 w-full h-48 object-cover rounded-xl" />
          ))}

        <button
          onClick={handleSubmit}
          disabled={!file || loading}
          className="mt-6 w-full py-3 bg-gray-900 text-white font-medium rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 transition cursor-pointer"
        >
          {loading
            ? "Analyzing..."
            : file?.type.startsWith("video/")
            ? "Check Video"
            : "Check Image"}
        </button>

        {loading && (
          <div className="mt-6 animate-pulse">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        )}

        {result && !loading && (
          <div
            className={`mt-6 p-4 rounded-xl text-center ${
              result.prediction === "Fake" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
            }`}
          >
            <p className="text-lg font-semibold">{result.prediction}</p>
            <p className="text-sm mb-2">{result.confidence}% confidence</p>

            <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
              <div
                className={`h-full ${result.prediction === "Fake" ? "bg-red-500" : "bg-green-500"}`}
                style={{ width: `${result.confidence}%` }}
              ></div>
            </div>

            {result.frames_analyzed && (
              <p className="text-xs text-gray-500 mt-2">Based on {result.frames_analyzed} frames</p>
            )}

            <p className="text-xs text-gray-500 mt-3">
              ⚠️ Trained on StyleGAN-generated faces — may not generalize to all AI image-generation methods.
            </p>
          </div>
        )}

        {(file || result) && (
          <button
            onClick={handleReset}
            className={`mt-3 w-full py-2 text-sm ${textSecondary} border ${borderColor} rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer`}
          >
            Try Another
          </button>
        )}

        {history.length > 0 && (
          <div className={`mt-8 pt-6 border-t ${borderColor}`}>
            <div className="flex justify-between items-center mb-3">
              <h2 className={`text-sm font-medium ${textPrimary}`}>Recent Checks</h2>
              <button
                onClick={() => setHistory([])}
                className={`text-xs ${textSecondary} hover:underline cursor-pointer`}
              >
                Clear
              </button>
            </div>
            <ul className="space-y-2">
              {history.map((item, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className={`${textSecondary} truncate max-w-[160px]`}>{item.name}</span>
                  <span
                    className={`font-medium ${
                      item.prediction === "Fake" ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {item.prediction} ({item.confidence}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      <p className={`mt-8 text-xs text-center ${textSecondary}`}>
          Powered by EfficientNet-B0. Trained on 100k faces.{" "}
          <a href="https://github.com/ali-faraz-py/deepfake-detector" target="_blank" rel="noopener noreferrer" className="underline">
            View on GitHub
          </a>
        </p>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </main>
  );
}