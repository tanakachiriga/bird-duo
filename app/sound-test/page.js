"use client";
export default function SoundTestPage() {
  const soundUrl = "https://xeno-canto.org/sounds/uploaded/MGXQXJKWJF/XC699337-Northern%20Cardinal.mp3";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100 text-center">
      <div className="bg-white shadow-lg rounded-xl p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">Northern Cardinal</h2>

        <button
          onClick={() => {
            console.log("Playing:", soundUrl);
            const audio = new Audio(soundUrl);
            audio.play().catch((e) =>
              console.error("Playback failed", e)
            );
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        >
          ▶️ Play Sound
        </button>
      </div>
    </main>
  );
}
