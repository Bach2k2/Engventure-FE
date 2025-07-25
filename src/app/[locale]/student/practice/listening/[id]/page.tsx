"use client";

import { Button } from "@/app/[locale]/components/ui/Button";
import listeningPracticeService from "@/lib/services/student/listening-practice.service";
import { Exercise } from "@/lib/types/exercise";
import { useLocale } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

export default function ListeningPracticeDetailPage() {
  const router = useRouter();
  const locale = useLocale();
  const { id } = useParams();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [hearts, setHearts] = useState(5);
  const [completedCount, setCompletedCount] = useState(0);

  const currentExercise = exercises[currentIndex];
  const totalExercises = exercises.length;
  const progress = useMemo(
    () => (totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0),
    [completedCount, totalExercises]
  );

  // Fetch Exercises
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const stored = localStorage.getItem("current_lesson");
        if (stored) {
          const LessonData = JSON.parse(stored);
          if (LessonData?.exercises?.length > 0) {
            setExercises(LessonData.exercises);
            setLoading(false);
            return;
          }
        }

        const result = await listeningPracticeService.getById(Number(id));
        if (result.success && result.dataListening) {
          const exercises = result.dataListening
          setExercises(exercises);
        } else {
          toast.error("Failed to load exercises");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Error loading exercises");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Audio control
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updatePlaying = () => setIsPlaying(!audio.paused);

    audio.addEventListener("play", updatePlaying);
    audio.addEventListener("pause", updatePlaying);
    audio.addEventListener("ended", () => setIsPlaying(false));

    return () => {
      audio.removeEventListener("play", updatePlaying);
      audio.removeEventListener("pause", updatePlaying);
      audio.removeEventListener("ended", () => setIsPlaying(false));
    };
  }, [currentIndex]);

  const handlePlay = useCallback(() => {
    const audio = audioRef.current;
    if (audio) isPlaying ? audio.pause() : audio.play();
  }, [isPlaying]);

  const handleOptionSelect = (key: string) => {
    if (!showResult) setSelectedOption(key);
  };

  const handleExercise = () => {
    if (!selectedOption) return toast.warning("Please select an answer first!");
    const correct = selectedOption === currentExercise.system_answer;
    setIsCorrect(correct);
    setShowResult(true);
    setShowExplanation(true);
    correct
      ? (setCompletedCount((c) => c + 1), toast.success("Correct!"))
      : (setHearts((h) => Math.max(0, h - 1)), toast.error("Incorrect."));
  };

  const resetQuestion = () => {
    setSelectedOption(null);
    setShowResult(false);
    setIsCorrect(false);
    setShowExplanation(false);
    setIsPlaying(false);
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  const handleNext = () => {
    if (currentIndex < totalExercises - 1) {
      setCurrentIndex((i) => i + 1);
      resetQuestion();
    } else {
      toast.success("Congratulations! You completed all exercises!");
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      resetQuestion();
    }
  };

  const getOptionStyle = (key: string) => {
    const base = "w-full p-4 text-left border-2 rounded-xl font-medium transition-all";
    if (!showResult) {
      return `${base} ${selectedOption === key
        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
        : "border-gray-200 hover:bg-gray-50"
        }`;
    }
    if (key === currentExercise.system_answer) return `${base} border-green-500 bg-green-50 text-green-800`;
    if (key === selectedOption && !isCorrect) return `${base} border-red-500 bg-red-50 text-red-800`;
    return `${base} border-gray-200 bg-gray-100 text-gray-500`;
  };

  const getOptionIcon = (key: string) => {
    if (!showResult) return null;
    if (key === currentExercise.system_answer) return <span className="text-green-600 font-bold">✓</span>;
    if (key === selectedOption && !isCorrect) return <span className="text-red-600 font-bold">✗</span>;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4 mx-auto" />
          <p className="text-gray-600">Loading exercises...</p>
        </div>
      </div>
    );
  }

  if (!currentExercise) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <p className="text-gray-600 text-lg">No exercises available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <Button
        variant="destructive"
        onClick={() => router.push(`/${locale}/student/practice/listening`)}
        className="mb-6"
      >
        <svg
          className="w-4 h-3 text-white mr-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 8 14"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13"
          />
        </svg>
        Back
      </Button>
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm mb-6">
          <div className="flex space-x-4">
            <button className="hover:bg-gray-100 p-2 rounded-lg">✖</button>
            <button className="hover:bg-gray-100 p-2 rounded-lg">⚙️</button>
          </div>

          <div className="flex-1 mx-6">
            <div className="flex justify-between text-sm mb-1 text-gray-600">
              <span>Question {currentIndex + 1} of {totalExercises}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center text-red-500">
            <span className="text-2xl">❤️</span>
            <span className="font-bold text-lg ml-1">{hearts}</span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between mb-4">
            <div className="flex space-x-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{currentExercise.level}</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">{currentExercise.skill}</span>
            </div>
            <span className="text-sm text-gray-500">{currentExercise.name}</span>
          </div>

          {/* Audio */}
          <div className="mb-8 p-4 bg-gray-50 rounded-xl">
            <audio
              ref={audioRef}
              src={`${process.env.NEXT_PUBLIC_GCS_BASE_URL}${currentExercise.audio_file_url}`}
              className="hidden"
            />
            <div className="text-center">
              <button
                onClick={handlePlay}
                className={`px-6 py-3 rounded-full text-white font-medium transition transform hover:scale-105 shadow-lg
                  ${isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}`}
              >
                {isPlaying ? "⏸️ Pause Audio" : "🔊 Play Audio"}
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4 mb-6">
            {currentExercise.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(option.key)}
                disabled={showResult}
                className={getOptionStyle(option.key)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold">
                      {option.key}
                    </span>
                    <span className="text-gray-800">{option.option}</span>
                  </div>
                  {getOptionIcon(option.key)}
                </div>
              </button>
            ))}
          </div>

          {/* Explanation */}
          {showExplanation && currentExercise.explanation && (
            <div className={`p-4 rounded-xl border-l-4 ${isCorrect ? "bg-green-50 border-green-400" : "bg-red-50 border-red-400"}`}>
              <h3 className="font-semibold mb-2 text-gray-800">Explanation:</h3>
              <p className="text-gray-700">{currentExercise.explanation}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-3">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-4 py-2 border rounded-full text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              ← Previous
            </button>
            <button className="px-4 py-2 border rounded-full text-gray-700 hover:bg-gray-100">
              Can't listen now
            </button>
          </div>

          <div className="flex space-x-3">
            {!showResult ? (
              <button
                onClick={handleExercise}
                className="px-8 py-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transform hover:scale-105"
              >
                Check Answer
              </button>
            ) : (
              <>
                {!isCorrect && (
                  <button
                    onClick={resetQuestion}
                    className="px-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600"
                  >
                    Try Again
                  </button>
                )}
                {currentIndex < totalExercises - 1 ? (
                  <button
                    onClick={handleNext}
                    className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transform hover:scale-105"
                  >
                    Next Question →
                  </button>
                ) : (
                  <button className="px-8 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700">
                    Complete! 🎉
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
