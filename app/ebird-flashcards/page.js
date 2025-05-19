"use client";
import { useEffect, useState, useRef } from "react";

const ebirdApiKey = "6vs3r7ekh8t";
const xenoApiKey = "7c1b1292511f1d13e036e34e437c3ac40d84ebff";

export default function FlashcardPage() {
  const [birds, setBirds] = useState([]);
  const [index, setIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [soundUrl, setSoundUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [soundLoading, setSoundLoading] = useState(true);
  const audioCache = useRef(new Map());

  const bird = birds[index];

  // 1. Get 10 birds from eBird
  useEffect(() => {
    fetch("https://api.ebird.org/v2/data/obs/US-NY/recent?maxResults=10", {
      headers: {
        "X-eBirdApiToken": ebirdApiKey,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setBirds(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("eBird error:", err);
        setLoading(false);
      });
  }, []);

  // 2. Load image + cached or fetched sound
  useEffect(() => {
    if (!bird) return;

    setImageUrl("");
    setSoundUrl("");
    setSoundLoading(true);

    const wikiName = bird.comName.replace(/ /g, "_");
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${wikiName}`)
      .then((res) => res.json())
      .then((data) => {
        setImageUrl(data.thumbnail?.source || "/placeholder-bird.jpg");
      })
      .catch(() => setImageUrl("/placeholder-bird.jpg"));

    const sciName = bird.sciName;
    if (audioCache.current.has(sciName)) {
      setSoundUrl(audioCache.current.get(sciName));
      setSoundLoading(false);
    } else {
      const [gen, sp] = sciName.toLowerCase().split(" ");
      const query = `gen:${gen}+sp:${sp}+q:A`;

      fetch(`https://xeno-canto.org/api/3/recordings?query=${query}&key=${xenoApiKey}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.recordings && data.recordings.length > 0) {
            const id = data.recordings[0].id;
            const url = `https://xeno-canto.org/${id}/download`;
            audioCache.current.set(sciName, url);
            setSoundUrl(url);
          } else {
            audioCache.current.set(sciName, "");
            setSoundUrl("");
          }
          setSoundLoading(false);
        })
        .catch(() => {
          audioCache.current.set(sciName, "");
          setSoundUrl("");
          setSoundLoading(false);
        });
    }
  }, [bird]);

  // 3. Preload the next bird’s sound
  useEffect(() => {
    if (!birds.length) return;
    const nextIndex = (index + 1) % birds.length;
    const nextBird = birds[nextIndex];
    const sciName = nextBird?.sciName;
    if (!sciName || audioCache.current.has(sciName)) return;

    const [gen, sp] = sciName.toLowerCase().split(" ");
    const query = `gen:${gen}+sp:${sp}+q:A`;

    fetch(`https://xeno-canto.org/api/3/recordings?query=${query}&key=${xenoApiKey}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.recordings && data.recordings.length > 0) {
          const id = data.recordings[0].id;
          const url = `https://xeno-canto.org/${id}/download`;
          audioCache.current.set(sciName, url);
        } else {
          audioCache.current.set(sciName, "");
        }
      })
      .catch(() => audioCache.current.set(sciName, ""));
  }, [index, birds]);

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % birds.length);
  };

  if (loading) return <p className="p-4">Loading birds...</p>;
  if (!birds.length) return <p className="p-4">No birds found.</p>;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100 text-center">
      <div className="bg-white shadow-lg rounded-xl p-6 max-w-sm w-full">
        <p className="text-gray-500 text-sm mb-2">
          Bird {index + 1} of {birds.length}
        </p>

        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={bird.comName}
            className="w-full h-[250px] object-cover object-top rounded-md mb-4"
          />
        )}

        <h2 className="text-xl font-bold mb-2">{bird.comName}</h2>

        {soundLoading ? (
          <p className="text-sm text-gray-500 mb-4">Loading sound...</p>
        ) : soundUrl ? (
          <audio controls className="mb-4 w-full" src={soundUrl}>
            Your browser does not support audio playback.
          </audio>
        ) : (
          <p className="text-xs text-gray-400 mb-4">No sound found</p>
        )}

        <button
          onClick={handleNext}
          className="text-sm text-gray-500 underline"
        >
          Next →
        </button>
      </div>
    </main>
  );
}
