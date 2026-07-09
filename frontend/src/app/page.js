"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    console.log("File selected:", e.target.files[0]);
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async () => {
    console.log("Button clicked, file is:", file);
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log("Sending request to backend...");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      console.log("Response received:", response.status);
      const data = await response.json();
      console.log("Data:", data);
      setResult(data);
    } catch (err) {
      console.error("Error occurred:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-3xl font-bold mb-8">Deepfake Detector</h1>

      <input type="file" accept="image/*" onChange={handleFileChange} />

      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className="mt-4 px-6 py-2 bg-black text-white rounded disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Analyzing..." : "Check Image"}
      </button>

      {error && (
        <div className="mt-8 text-xl text-red-600">
          <p>Error: {error}</p>
        </div>
      )}

      {result && (
        <div className="mt-8 text-xl">
          <p>Prediction: {result.prediction}</p>
          <p>Confidence: {result.confidence}%</p>
        </div>
      )}
    </main>
  );
}