"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [history, setHistory] = useState([]);
  const fileInputRef = useRef(null);

  const processFile = (selected) => {
    if (!selected) return;
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
    const dropped = e.dataTransfer.files[0];
    processFile(dropped);
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

      const data = await response.json();
      setResult(data);

      setHistory((prev) => [
        {
          name: file.name,
          prediction: data.prediction,
          confidence: data.confidence,
          type: file.type.startsWith("video/") ? "video" : "image",
        },
        ...prev,
      ].slice(0, 5));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Deepfake Detector
        </h1>
        <p className="text-sm text-center text-gray-500 mb-6">
          Upload a face image/video to check if it's real or AI-generated.
        </p>

        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition ${
            isDragging
              ? "border-gray-900 bg-gray-100"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <span className="text-sm text-gray-500 mb-2 text-center">
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
            <video
              src={preview}
              controls
              className="mt-4 w-full h-48 object-cover rounded-xl"
            />
          ) : (
            <img
              src={preview}
              alt="Preview"
              className="mt-4 w-full h-48 object-cover rounded-xl"
            />
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

        {error && (
          <p className="mt-4 text-sm text-red-600 text-center">
            Something went wrong: {error}
          </p>
        )}

        {result && (
          <div
            className={`mt-6 p-4 rounded-xl text-center ${
              result.prediction === "Fake"
                ? "bg-red-50 text-red-700"
                : "bg-green-50 text-green-700"
            }`}
          >
            <p className="text-lg font-semibold">{result.prediction}</p>
            <p className="text-sm">{result.confidence}% confidence</p>
            {result.frames_analyzed && (
              <p className="text-xs text-gray-500 mt-1">
                Based on {result.frames_analyzed} frames
              </p>
            )}
          </div>
        )}

        {(file || result) && (
          <button
            onClick={handleReset}
            className="mt-3 w-full py-2 text-sm text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition cursor-pointer"
          >
            Try Another
          </button>
        )}

        {history.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-sm font-medium text-gray-700 mb-3">
              Recent Checks
            </h2>
            <ul className="space-y-2">
              {history.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-600 truncate max-w-[160px]">
                    {item.name}
                  </span>
                  <span
                    className={`font-medium ${
                      item.prediction === "Fake"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {item.prediction} ({item.confidence}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}