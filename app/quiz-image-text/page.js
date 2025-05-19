"use client";
import { useEffect, useState, useRef } from "react";

const ebirdApiKey = "6vs3r7ekh8t";

export default function ImageMatchPage() {
  const [birds, setBirds] = useState([]);
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [correct, setCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizIndex, setQuizIndex] = useState(0);

  useEffect(() => {
    fetch("https://api.ebird.org/v2/data/obs/US-NY/recent?maxResults=10", {
      headers: {
        "X-eBirdApiToken": ebirdApiKey,
      },
    })
      .then((res) => res.json())
      .then(async (data) => {
        const fetches = data.map(async (bird) => {
          if (!bird.sciName || !bird.sciName.includes(" ")) return null;
          const wikiTitle = bird.comName.replace(/ /g, "_");

          const wikiRes = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${wikiTitle}`
          ).then((r) => r.json()).catch(() => ({}));

          return {
            ...bird,
            imageUrl: wikiRes.thumbnail?.source || "",
            summary: wikiRes.extract || "",
          };
        });

        const results = await Promise.all(fetches);
        const validBirds = results.filter((b) => b && b.imageUrl);
        setBirds(validBirds);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (birds.length < 4 || quizIndex >= birds.length) return;
    const answer = birds[quizIndex];
    const decoys = birds.filter(b => b.comName !== answer.comName)
                        .sort(() => 0.5 - Math.random())
                        .slice(0, 3);
    const options = [...decoys, answer].sort(() => 0.5 - Math.random());
    setQuestion({ answer, options });
    setSelected(null);
    setCorrect(null);
  }, [birds, quizIndex]);

  const handleSelect = (name) => {
    setSelected(name);
    const isCorrect = name === question.answer.comName;
    setCorrect(isCorrect);
    if (isCorrect) setScore((s) => s + 1);
  };

  const handleRestart = () => {
    setQuizIndex(0);
    setScore(0);
    setSelected(null);
    setCorrect(null);
  };

  if (loading || !question) return <p className="p-4">Loading game...</p>;

  return (
    <main className="min-h-screen bg-yellow-50 p-6 flex flex-col items-center justify-center">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-8 mb-6">
        <div className="bg-white p-6 rounded-xl shadow max-w-md w-full">
          <p className="text-sm text-gray-500 mb-2">
            Question {quizIndex + 1} of {birds.length} | Score: {score}
          </p>
          <h2 className="text-xl font-bold mb-4">
            Which name matches this bird image?
          </h2>
          <div className="mb-4">
            <img
              src={question.answer.imageUrl}
              alt={question.answer.comName}
              className="w-full aspect-square object-cover object-top rounded"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {question.options.map((opt) => (
              <button
                key={opt.comName}
                onClick={() => handleSelect(opt.comName)}
                disabled={!!selected}
                className={`w-full px-4 py-2 rounded border text-sm font-medium ${
                  selected
                    ? opt.comName === question.answer.comName
                      ? "bg-green-100 border-green-400 text-green-700"
                      : selected === opt.comName
                      ? "bg-red-100 border-red-400 text-red-700"
                      : "bg-white border-gray-300"
                    : "bg-white border-gray-300 hover:bg-gray-50"
                }`}
              >
                {opt.comName}
              </button>
            ))}
          </div>
        </div>

        {selected && correct && Math.random() > 0.5 && question.answer.summary && (
          <div className="bg-white shadow border border-gray-200 rounded p-4 w-full max-w-xs self-center text-left">
            <strong className="block text-sm font-bold mb-1">Did you know?</strong>
            <p className="text-sm text-gray-700">{question.answer.summary}</p>
          </div>
        )}
      </div>

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
            Game Complete! 🎉 You got {score} out of {birds.length} correct.
          </p>
          <button
            onClick={handleRestart}
            className="text-sm text-blue-600 underline"
          >
            Restart
          </button>
        </div>
      )}
    </main>
  );
}
