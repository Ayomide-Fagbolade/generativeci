"use client";

import { useState, useEffect } from "react";
import { db } from "@/app/firebase/config";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import EditQuestionModal from "./editquestion"; // Adjust the import path as needed

interface Question {
  id: string;
  question: string;
  options: { text: string; votes: number }[]; // Updated to match the voting system structure
}

interface QuestionsListProps {
  storyId: string; // Story ID passed from parent
}

const QuestionsList: React.FC<QuestionsListProps> = ({ storyId }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Fetch questions from Firestore
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const questionsRef = collection(db, "stories", storyId, "questions");
        const querySnapshot = await getDocs(questionsRef);
        const fetchedQuestions: Question[] = [];

        querySnapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          fetchedQuestions.push({
            id: docSnapshot.id,
            question: data.question,
            options: data.options || [], // Ensure options exist, even if empty
          });
        });

        setQuestions(fetchedQuestions);
      } catch (err) {
        setError("Failed to load questions.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [storyId]);

  // Delete a question
  const handleDelete = async (questionId: string) => {
    try {
      await deleteDoc(doc(db, "stories", storyId, "questions", questionId));
      setQuestions(questions.filter((q) => q.id !== questionId));
    } catch (err) {
      setError("Failed to delete question.");
    }
  };

  // Open the modal for editing
  const handleEdit = (questionId: string) => {
    setEditingQuestionId(questionId);
    setIsModalOpen(true);
  };

  // Close the modal
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingQuestionId(null);
  };

  if (loading) return <div>Loading...</div>;

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {questions.length === 0 ? (
        <div>No questions available.</div>
      ) : (
        questions.map((question) => (
          <Card key={question.id} className="space-y-4">
            <CardContent>
              <CardTitle>{question.question}</CardTitle>
              <CardDescription>
                <ul>
                  {question.options.length > 0 ? (
                    question.options.map((option, index) => (
                      <li key={index}>
                        {option.text} - Votes: {option.votes}
                      </li>
                    ))
                  ) : (
                    <li>No options available</li>
                  )}
                </ul>
              </CardDescription>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button onClick={() => handleEdit(question.id)}>Edit</Button>
              <Button
                onClick={() => handleDelete(question.id)}
                variant="outline"
                className="text-red-500"
              >
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))
      )}

      {/* Edit Question Modal */}
      {isModalOpen && editingQuestionId && (
        <EditQuestionModal
          storyId={storyId}
          questionId={editingQuestionId}
          onClose={handleModalClose}
          isOpen={isModalOpen}
        />
      )}
    </div>
  );
};

export default QuestionsList;
