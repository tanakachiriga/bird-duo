"use client";
import { useState, useRef, useEffect } from "react";

const birds = [
  {
    name: "American Robin",
    image: "/birds/images/american-robin.jpg",
    sound: "/birds/sounds/american-robin.mp3",
  },
  {
    name: "Blue Jay",
    image: "/birds/images/blue-jay.jpg",
    sound: "/birds/sounds/blue-jay.mp3",
  },
  // Add more birds here later
];

export default function Home() {
  const [index, setIndex] = useState(0);
  const [showName, setShowName] = useState(false);
  const audioRef = useRef(null);

  const bird = birds[index];

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const newAudio = new Audio(bird.sound);
    newAudio.play();
    audioRef.current = newAudio;
  };

  const handleNext = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setShowName(false);
    setIndex((prev) => (prev + 1) % birds.length);
  };

  const handlePrev = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setShowName(false);
    setIndex((prev) =>
      prev === 0 ? birds.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100 text-center">
      <div className="bg-white shadow-lg rounded-xl p-6 max-w-sm w-full">
        <p className="text-gray-500 text-sm mb-2">
          Bird {index + 1} of {birds.length}
        </p>
        <img
          src={bird.image}
          alt={bird.name}
          className="rounded-md mb-4"
        />
        <button
          onClick={handlePlay}
          className="bg-blue-600 text-white px-4 py-2 rounded mb-2"
        >
          ▶️ Play Sound
        </button>
        <br />
        <button
          onClick={() => setShowName(!showName)}
          className="text-blue-600 underline"
        >
          {showName ? "Hide Name" : "Show Name"}
        </button>
        {showName && (
          <h2 className="mt-2 text-xl font-semibold">{bird.name}</h2>
        )}
        <div className="mt-4 flex justify-between">
          <button
            onClick={handlePrev}
            className="text-sm text-gray-500 underline mr-4"
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}
            className="text-sm text-gray-500 underline"
          >
            Next →
          </button>
        </div>
      </div>
    </main>
  );
}
