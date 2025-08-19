"use client";

import { useState } from "react";
import { db } from "@/app/firebase/config";
import { collection, addDoc, doc, deleteDoc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

const SHARD_COUNT = 10; // Number of shards to pre-create

interface AddQuestionProps {
  storyId: string; // storyId passed from parent
  onClose: () => void; // Callback to close the modal
}

const AddQuestion: React.FC<AddQuestionProps> = ({ storyId, onClose }) => {
  const [question, setQuestion] = useState<string>("");
  const [options, setOptions] = useState<{ text: string; votes: number }[]>([{ text: "", votes: 0 }]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [questionId, setQuestionId] = useState<string | null>(null);

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...options];
    updatedOptions[index].text = value;
    setOptions(updatedOptions);
  };

  const handleAddOption = async () => {
    const newOption = { text: "", votes: 0 };
    setOptions([...options, newOption]);

    if (questionId) {
      // Initialize shards for the new option
      const optionIndex = options.length;
      await initializeShards(questionId, optionIndex);
    }
  };

  const handleRemoveOption = async (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    setOptions(updatedOptions);

    if (questionId) {
      // Delete shards for the removed option
      await deleteShards(questionId, index);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!question.trim() || options.some((option) => option.text.trim() === "")) {
      setError("Please provide a question and valid options.");
      setLoading(false);
      return;
    }

    try {
      const questionRef = collection(db, "stories", storyId, "questions");
      const newQuestionDoc = await addDoc(questionRef, {
        question: question,
        options: options.filter((option) => option.text.trim() !== ""),
      });

      setQuestionId(newQuestionDoc.id);

      // Initialize shards for all options
      for (let i = 0; i < options.length; i++) {
        await initializeShards(newQuestionDoc.id, i);
      }

      setQuestion("");
      setOptions([{ text: "", votes: 0 }]);
      alert("Question added successfully!");
      onClose();
    } catch (error) {
      console.error("Error adding question:", error);
      setError("Failed to add question.");
    } finally {
      setLoading(false);
    }
  };

  const initializeShards = async (questionId: string, optionIndex: number) => {
    const shardsCollectionRef = collection(
      db,
      `stories/${storyId}/questions/${questionId}/options/${optionIndex}/shards`
    );

    for (let shardId = 0; shardId < SHARD_COUNT; shardId++) {
      const shardRef = doc(shardsCollectionRef, `shard_${shardId}`);
      await setDoc(shardRef, { votes: 0 });
    }
  };

  const deleteShards = async (questionId: string, optionIndex: number) => {
    const shardsCollectionRef = collection(
      db,
      `stories/${storyId}/questions/${questionId}/options/${optionIndex}/shards`
    );

    for (let shardId = 0; shardId < SHARD_COUNT; shardId++) {
      const shardRef = doc(shardsCollectionRef, `shard_${shardId}`);
      await deleteDoc(shardRef);
    }
  };

  return (
    <DialogContent>
      <DialogTitle>Add Question</DialogTitle>
      {error && (
        <DialogDescription className="text-red-500">{error}</DialogDescription>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="question" className="block text-lg font-medium">
            Question Text
          </label>
          <Textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter the question text"
            required
            className="h-24"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="options" className="block text-lg font-medium">
            Options
          </label>
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-4">
              <Input
                value={option.text}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                required
              />
              {options.length > 1 && (
                <Button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  variant="outline"
                  className="text-red-500"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-start gap-4">
          <Button type="button" onClick={handleAddOption} variant="outline">
            Add Option
          </Button>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="outline" disabled={loading}>
            Add Question
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default AddQuestion;
