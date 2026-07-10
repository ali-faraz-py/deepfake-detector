"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setResult(null);
    setError(null);

    if (selected) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
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

        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-gray-400 transition">
          <span className="text-sm text-gray-500 mb-2">
            {file ? file.name : "Click to select an image/video"}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-4 w-full h-48 object-cover rounded-xl"
          />
        )}

        <button
          onClick={handleSubmit}
          disabled={!file || loading}
          className="mt-6 w-full py-3 bg-gray-900 text-white font-medium rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 transition cursor-pointer"
        >
          {loading ? "Analyzing..." : "Check Image"}
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
          </div>
        )}
      </div>
    </main>
  );
}