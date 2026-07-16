import React, { useState } from "react";
import { Paperclip } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import PageNavigation from "../../components/page-navigation";

export default function AddQuestion() {
  const [searchParams] = useSearchParams();
  const selectedLevel = searchParams.get("level");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState({
    A: "",
    B: "",
    C: "",
    D: "",
  });

  const [correctAnswer, setCorrectAnswer] = useState("");
  const [ageGroups, setAgeGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [levels, setLevels] = useState([]);

  const toggle = (setState, state, value) => {
    setState(
      state.includes(value)
        ? state.filter((v) => v !== value)
        : [...state, value]
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <PageNavigation items={[{ label: "Content", to: "/content" }, { label: "Add Question" }]} title="Add New Question" description={selectedLevel ? "This question will be assigned to the selected level." : "Create a question and assign it to a learning level."} />
      {selectedLevel && <div className="mb-6 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-700"><strong>Selected level:</strong> {selectedLevel}</div>}

      {/* Question Text */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Question Text
        </label>
        <input
          type="text"
          placeholder="Enter question text"
          className="w-2/3 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />
      </div>

      <div className=" flex items-center gap-4 ">
        <label className="block text-gray-700 font-medium mb-2">Options</label>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {["A", "B", "C", "D"].map((opt) => (
            <div
              key={opt}
              className="flex items-center border rounded-xl px-4 py-3 gap-2 bg-white"
            >
              <input
                type="text"
                placeholder={`Option ${opt}`}
                className="flex-1 outline-none"
                value={options[opt]}
                onChange={(e) =>
                  setOptions({ ...options, [opt]: e.target.value })
                }
              />
              <Paperclip className="w-4 h-4 text-gray-400" />
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-gray-700 font-medium mb-2">
          Correct Answer
        </label>
        <select
          className="w-2/3 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
        >
          <option value="">Pick the correct option</option>
          <option value="A">Option A</option>
          <option value="B">Option B</option>
          <option value="C">Option C</option>
          <option value="D">Option D</option>
        </select>
      </div>

      {/* Age Groups */}
      <div className="mb-8">
        <h3 className="text-gray-700 font-medium mb-3">Age Groups</h3>
        <div className="grid grid-cols-2 gap-y-4">
          {[
            { id: "toddler", label: "Toddler (2–4 years)" },
            { id: "preschool", label: "Preschool (4–6 years)" },
            { id: "kindergarten", label: "Kindergarten (5–7 years)" },
            { id: "elementary", label: "Elementary (6–8 years)" },
          ].map((age) => (
            <label
              key={age.id}
              className="flex items-center gap-3"
            >
              <input
                type="checkbox"
                checked={ageGroups.includes(age.id)}
                onChange={() => toggle(setAgeGroups, ageGroups, age.id)}
                // className="w-4 h-4 rounded focus:ring-purple-500"
                className="w-4 h-4 rounded appearance-none border border-gray-400 
             checked:bg-purple-600 checked:border-purple-600 
             focus:ring-purple-500 cursor-pointer"
              />
              <span className="text-gray-800">{age.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h3 className="text-gray-700 font-medium mb-3">Categories</h3>
        <div className="grid grid-cols-1 gap-y-4">
          {[
            { id: "math", label: "Mathematics" },
            { id: "english", label: "English Language" },
          ].map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-3"
            >
              <input
                type="checkbox"
                checked={categories.includes(cat.id)}
                onChange={() => toggle(setCategories, categories, cat.id)}
                // className="w-4 h-4 rounded focus:ring-purple-500"
                className="w-4 h-4 rounded appearance-none border border-gray-400 
             checked:bg-purple-600 checked:border-purple-600 
             focus:ring-purple-500 cursor-pointer"
              />
              <span className="text-gray-800">{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Levels */}
      <div className="mb-12">
        <h3 className="text-gray-700 font-medium mb-3">Levels</h3>
        <div className="grid grid-cols-1 gap-y-4">
          {[1, 2].map((num) => (
            <label
              key={num}
              className="flex items-center gap-3"
            >
              <input
                type="checkbox"
                checked={levels.includes(num)}
                onChange={() => toggle(setLevels, levels, num)}
                // className="w-4 h-4 rounded focus:ring-purple-500"
                className="w-4 h-4 rounded appearance-none border border-gray-400 
             checked:bg-purple-600 checked:border-purple-600 
             focus:ring-purple-500 cursor-pointer"
              />
              <span className="text-gray-800">{num}</span>
            </label>
          ))}
        </div>
      </div>

      <Link to="/content/upload-files">
        <div className="flex justify-end">
          <button className="bg-purple-500 text-white px-6 py-3 rounded-xl hover:bg-purple-600 transition">
            Continue
          </button>
        </div>
      </Link>
    </div>
  );
}
