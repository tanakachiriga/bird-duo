"use client";
import { useEffect, useState } from "react";

export default function FlashcardPage() {
  const [imageUrl, setImageUrl] = useState("");
  const [soundUrl, setSoundUrl] = useState("");

  const bird = {
    commonName: "Northern Cardinal",
    gen: "cardinalis",
    sp: "cardinalis"
  };

  useEffect(() => {
    // Fetch Wikipedia image
    const wikiName = bird.commonName.replace(/ /g, "_");
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${wikiName}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.thumbnail?.source) {
          setImageUrl(data.thumbnail.source);
        } else {
          setImageUrl("/placeholder-bird.jpg");
        }
      })
      .catch(() => setImageUrl("/placeholder-bird.jpg"));

    // Fetch Xeno-Canto v3 recording
    const query = `gen:${bird.gen}+sp:${bird.sp}`;
    const apiKey = "7c1b1292511f1d13e036e34e437c3ac40d84ebff";

    fetch(`https://xeno-canto.org/api/3/recordings?query=${query}&key=${apiKey}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.recordings && data.recordings.length > 0) {
          const recordingId = data.recordings[0].id;
          setSoundUrl(`https://xeno-canto.org/${recordingId}/download`);
        } else {
          setSoundUrl("");
        }
      })
      .catch(() => setSoundUrl(""));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100 text-center">
      <div className="bg-white shadow-lg rounded-xl p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold mb-2">{bird.commonName}</h2>

        {imageUrl && (
          <img
            src={imageUrl}
            alt={bird.commonName}
            className="w-full h-[250px] object-cover object-top rounded-md mb-4"
          />
        )}

        {soundUrl ? (
          <audio controls className="mb-4 w-full" src={soundUrl}>
            Your browser does not support audio playback.
          </audio>
        ) : (
          <p className="text-xs text-gray-400 mb-4">No sound found</p>
        )}
      </div>
    </main>
  );
}
ssssssaskdjhaksjdhaksjh