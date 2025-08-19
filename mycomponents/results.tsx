import { useState, useEffect } from "react";
import { db } from "@/app/firebase/config";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/mycomponents/spinner";

interface Option {
  text: string;
  votes: number; // Aggregated vote count
}

interface Question {
  id: string;
  question: string;
  options: Option[];
}

interface ResultsProps {
  storyId: string; // Story ID passed from parent
}

const Results: React.FC<ResultsProps> = ({ storyId }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch and aggregate shard data
  const fetchQuestionsWithAggregatedVotes = async () => {
    setLoading(true);
    try {
      const questionsRef = collection(db, "stories", storyId, "questions");
      const querySnapshot = await getDocs(questionsRef);
      const fetchedQuestions: Question[] = [];

      for (const questionDoc of querySnapshot.docs) {
        const questionData = questionDoc.data();
        const options = questionData.options || [];

        // Aggregate shards for each option
        const aggregatedOptions: Option[] = [];
        for (const [index, option] of options.entries()) {
          const shardsRef = collection(
            db,
            "stories",
            storyId,
            "questions",
            questionDoc.id,
            "options",
            index.toString(),
            "shards"
          );
          const shardsSnapshot = await getDocs(shardsRef);

          let totalVotes = 0;
          shardsSnapshot.forEach((shardDoc) => {
            totalVotes += shardDoc.data().votes || 0;
          });

          aggregatedOptions.push({
            text: option.text,
            votes: totalVotes,
          });
        }

        // Update the question document with the aggregated options
        const questionDocRef = doc(db, "stories", storyId, "questions", questionDoc.id);
        await updateDoc(questionDocRef, {
          options: aggregatedOptions, // Update the entire options array with aggregated votes
        });

        fetchedQuestions.push({
          id: questionDoc.id,
          question: questionData.question,
          options: aggregatedOptions,
        });
      }

      setQuestions(fetchedQuestions);
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Failed to load questions with aggregated votes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionsWithAggregatedVotes();
  }, [storyId]);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
       loading......
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 text-center mt-4">
        <p>{error}</p>
      </div>
    );

  if (questions.length === 0) {
    return <div className="text-center text-gray-500 italic">No questions available.</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const totalVotes = currentQuestion.options.reduce((sum, option) => sum + option.votes, 0);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="border-0 p-6">
        <CardContent>
          <CardTitle className="text-lg font-bold text-black mb-4">
            {currentQuestion.question}
          </CardTitle>
          <CardDescription>
            <ul className="mt-4 space-y-6">
              {currentQuestion.options.map((option, index) => {
                const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0; // Calculate percentage
                return (
                  <li
                    key={index}
                    className="p-5 rounded-lg border border-orange-200 bg-orange-50"
                  >
                    <p className="text-gray-700 font-medium mb-3">{option.text}</p>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-orange-500 h-4 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{option.votes} votes</p>
                  </li>
                );
              })}
            </ul>
          </CardDescription>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-50"
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentQuestionIndex === questions.length - 1}
          className="bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Results;
