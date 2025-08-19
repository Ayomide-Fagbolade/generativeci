"use client";

import { useState, useEffect } from "react";
import { db } from "@/app/firebase/config";
import { doc, getDoc, updateDoc, collection, setDoc, deleteDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogPortal,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

const SHARD_COUNT = 10; // Number of shards to pre-create

interface EditQuestionModalProps {
  storyId: string;
  questionId: string;
  onClose: () => void;
  isOpen: boolean;
}

const EditQuestionModal: React.FC<EditQuestionModalProps> = ({
  storyId,
  questionId,
  onClose,
  isOpen,
}) => {
  const [question, setQuestion] = useState<string>("");
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const questionRef = doc(db, "stories", storyId, "questions", questionId);
        const questionSnapshot = await getDoc(questionRef);

        if (questionSnapshot.exists()) {
          const data = questionSnapshot.data();
          setQuestion(data.question || "");
          setOptions(data.options.map((option: { text: string }) => option.text) || []);
        } else {
          setError("Question not found.");
        }
      } catch (err) {
        setError("Failed to load question.");
      }
    };

    if (isOpen) {
      fetchQuestion();
    }
  }, [storyId, questionId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!question.trim() || options.some((option) => option.trim() === "")) {
      setError("Please provide valid question text and options.");
      setLoading(false);
      return;
    }

    try {
      const questionRef = doc(db, "stories", storyId, "questions", questionId);
      await updateDoc(questionRef, {
        question: question,
        options: options.filter((option) => option.trim() !== "").map((option) => ({ text: option, votes: 0 })),
      });

      alert("Question updated successfully!");
      onClose();
    } catch (err) {
      setError("Failed to update question.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const handleAddOption = async () => {
    const newOptionIndex = options.length;
    setOptions([...options, ""]);

    // Initialize shards for the new option
    await initializeShards(newOptionIndex);
  };

  const handleRemoveOption = async (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    setOptions(updatedOptions);

    // Delete shards for the removed option
    await deleteShards(index);
  };

  const initializeShards = async (optionIndex: number) => {
    const shardsCollectionRef = collection(
      db,
      `stories/${storyId}/questions/${questionId}/options/${optionIndex}/shards`
    );

    for (let shardId = 0; shardId < SHARD_COUNT; shardId++) {
      const shardRef = doc(shardsCollectionRef, `shard_${shardId}`);
      await setDoc(shardRef, { votes: 0 });
    }
  };

  const deleteShards = async (optionIndex: number) => {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogContent className="max-w-lg mx-auto bg-white rounded-lg p-6">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>

          {error && <DialogDescription className="text-red-500">{error}</DialogDescription>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="question" className="block text-lg font-medium">
                Question Text
              </label>
              <Textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Edit the question text"
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
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="text-red-500"
                    onClick={() => handleRemoveOption(index)}
                    disabled={options.length <= 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-start gap-4">
              <Button type="button" onClick={handleAddOption} variant="outline">
                Add Option
              </Button>
            </div>

            <div className="flex justify-end gap-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" variant="outline" disabled={loading}>
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default EditQuestionModal;
