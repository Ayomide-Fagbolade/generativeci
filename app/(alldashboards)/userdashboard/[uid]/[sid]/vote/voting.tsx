import { useState } from "react";
import { db } from "@/app/firebase/config";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { doc, collection, setDoc, updateDoc, increment } from "firebase/firestore";

type Option = {
  text: string;
  votes: number;
};

type Questions = {
  id: string;
  question: string;
  options: Option[];
};

const SHARD_COUNT = 10;

type VotingProps = {
  sid: string;
  questions: Questions[];
  uid: string;
};

const Voting = ({ sid, questions, uid }: VotingProps) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleOptionSelect = (questionId: string, optionIndex: number) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const incrementVote = async (questionId: string, optionIndex: number) => {
    const shardId = Math.floor(Math.random() * SHARD_COUNT);
    const shardRef = doc(
      db,
      `stories/${sid}/questions/${questionId}/options/${optionIndex}/shards/shard_${shardId}`
    );
    await updateDoc(shardRef, {
      votes: increment(1),
    });
  };

  const handleSubmit = async () => {
    try {
      const votersDetailsRef = collection(db, `stories/${sid}/votersDetails`);
      const voterDocRef = doc(votersDetailsRef, uid);

      await setDoc(voterDocRef, { userId: uid });

      const voteDetailsRef = collection(voterDocRef, "voteDetails");

      for (const [questionId, optionIndex] of Object.entries(selectedOptions)) {
        await incrementVote(questionId, optionIndex);
        const voteDetailDocRef = doc(voteDetailsRef, questionId);
        await setDoc(voteDetailDocRef, { questionId, optionIndex });
      }

      // alert("Your votes have been recorded!");
      // refresh the page
      window.location.reload();
    } catch (err) {
      console.error("Error submitting votes:", err);
      setError("There was an error submitting your votes.");
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg p-6">
      <div>
        <Card className="shadow-none border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-orange-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <h2 className="text-xl font-semibold text-orange-500">{currentQuestion.question}</h2>
            <ul className="space-y-2">
              {currentQuestion.options.map((option, index) => (
                <li
                  key={index}
                  onClick={() => handleOptionSelect(currentQuestion.id, index)}
                  className={`cursor-pointer p-3 rounded-lg border transition-all duration-300 ${
                    selectedOptions[currentQuestion.id] === index
                      ? "bg-orange-100 border-orange-300"
                      : "hover:bg-gray-100 border-gray-200"
                  }`}
                >
                  {option.text}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="bg-gray-500 text-white hover:bg-gray-600"
            >
              Previous
            </Button>
            {currentQuestionIndex === questions.length - 1 ? (
              <Button onClick={handleSubmit} className="bg-orange-600 text-white hover:bg-orange-700">
                Submit Votes
              </Button>
            ) : (
              <Button onClick={handleNext} className="bg-orange-500 text-white hover:bg-orange-600">
                Next
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  );
};

export default Voting;
