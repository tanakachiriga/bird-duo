"use client";
import { useEffect, useState, useRef } from "react";

const ebirdApiKey = "6vs3r7ekh8t";
const xenoApiKey = "7c1b1292511f1d13e036e34e437c3ac40d84ebff";

function loadAudioCache() {
  try {
    const cached = JSON.parse(localStorage.getItem("bird-audio-cache") || "{}");
    return new Map(Object.entries(cached));
  } catch {
    return new Map();
  }
}

function saveAudioCache(map) {
  const obj = Object.fromEntries(map);
  localStorage.setItem("bird-audio-cache", JSON.stringify(obj));
}

export default function QuizPage() {
  const [birds, setBirds] = useState([]);
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [correct, setCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizIndex, setQuizIndex] = useState(0);
  const audioCache = useRef(loadAudioCache());

  useEffect(() => {
    fetch("https://api.ebird.org/v2/data/obs/US-NY/recent?maxResults=10", {
      headers: { "X-eBirdApiToken": ebirdApiKey },
    })
      .then((res) => res.json())
      .then(async (data) => {
        const fetches = data.map(async (bird) => {
          if (!bird.sciName || !bird.sciName.includes(" ")) return null;
          const sciName = bird.sciName;

          let soundUrl = audioCache.current.get(sciName);
          if (!soundUrl) {
            const [gen, sp] = sciName.toLowerCase().split(" ");
            const query = `gen:${gen}+sp:${sp}+q:A`;
            try {
              const res = await fetch(`https://xeno-canto.org/api/3/recordings?query=${query}&key=${xenoApiKey}`);
              const json = await res.json();
              if (json.recordings?.length) {
                const id = json.recordings[0].id;
                soundUrl = `https://xeno-canto.org/${id}/download`;
                audioCache.current.set(sciName, soundUrl);
              } else {
                audioCache.current.set(sciName, "");
              }
            } catch {
              return null;
            }
          }

          const wikiTitle = bird.comName.replace(/ /g, "_");
          const wiki = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${wikiTitle}`)
            .then((r) => r.json())
            .catch(() => ({}));

          if (!soundUrl) return null;

          return {
            ...bird,
            soundUrl,
            imageUrl: wiki.thumbnail?.source || "",
            summary: wiki.extract || "",
          };
        });

        const results = await Promise.all(fetches);
        const withSounds = results.filter((b) => b && b.soundUrl);
        saveAudioCache(audioCache.current);
        setBirds(withSounds);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (birds.length < 4 || quizIndex >= birds.length) return;
    const answer = birds[quizIndex];
    const decoys = birds.filter(b => b.sciName !== answer.sciName).sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [...decoys, answer].sort(() => 0.5 - Math.random());
    setQuestion({ answer, options });
    setSelected(null);
    setCorrect(null);
  }, [birds, quizIndex]);

  const handleSelect = (bird) => {
    setSelected(bird);
    const isCorrect = bird.sciName === question.answer.sciName;
    setCorrect(isCorrect);
    if (isCorrect) setScore((prev) => prev + 1);
  };

  const handleRestart = () => {
    setQuizIndex(0);
    setScore(0);
    setSelected(null);
    setCorrect(null);
  };

  if (loading || !question) return <p className="p-4">Loading quiz...</p>;

  return (
    <main className="min-h-screen bg-blue-50 p-6 flex flex-col items-center justify-center text-center">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-8 mb-6">
        {/* Quiz Card */}
        <div className="bg-white shadow-lg rounded-xl p-6 max-w-md w-full">
          <p className="text-sm text-gray-500 mb-2">
            Question {quizIndex + 1} of {birds.length} | Score: {score}
          </p>

          <h2 className="text-xl font-bold mb-4">Which bird makes this sound?</h2>

          <audio controls className="mb-6 w-full" src={question.answer.soundUrl}>
            Your browser does not support audio.
          </audio>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {question.options.map((bird) => (
              <button
                key={bird.sciName}
                onClick={() => handleSelect(bird)}
                className={`flex flex-col items-center justify-center w-full p-2 rounded border transition text-center
                  ${selected
                    ? bird.sciName === question.answer.sciName
                      ? "bg-green-100 border-green-400 text-green-700"
                      : selected === bird
                      ? "bg-red-100 border-red-400 text-red-700"
                      : "bg-white border-gray-300"
                    : "bg-white border-gray-300 hover:bg-gray-50"}`}
                disabled={!!selected}
              >
                {bird.imageUrl ? (
                  <img src={bird.imageUrl} alt={bird.comName} className="w-full h-32 object-cover object-top rounded mb-2" />
                ) : (
                  <div className="w-full h-32 bg-gray-200 rounded mb-2" />
                )}
                <span className="text-sm font-medium">{bird.comName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* "Did You Know?" modal */}
        {selected && correct && Math.random() > 0.5 && question.answer.summary && (
          <div className="bg-white shadow border border-gray-200 rounded p-4 w-full max-w-xs self-center text-left">
            <strong className="block text-sm font-bold mb-1">Did you know?</strong>
            <p className="text-sm text-gray-700">{question.answer.summary}</p>
          </div>
        )}
      </div>

      {/* Bottom Section – Next or End */}
      {selected && quizIndex + 1 < birds.length && (
        <button
          onClick={() => setQuizIndex((prev) => prev + 1)}
          className="text-sm text-blue-600 underline"
        >
          Next Question →
        </button>
      )}

      {selected && quizIndex + 1 === birds.length && (
        <div className="mt-4 text-center">
          <p className="font-semibold text-green-700 mb-2">
            Quiz Complete! 🎉 You got {score} out of {birds.length} correct.
          </p>
          <button
            onClick={handleRestart}
            className="text-sm text-blue-600 underline"
          >
            Restart Quiz
          </button>
        </div>
      )}
    </main>
  );
}
