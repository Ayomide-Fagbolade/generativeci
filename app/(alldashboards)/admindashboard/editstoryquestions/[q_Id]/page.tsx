"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // Import useParams from next/navigation
import { db } from "@/app/firebase/config"; // Adjust path to your Firebase config
import { doc, getDoc, updateDoc } from "firebase/firestore"; // Import updateDoc
import { Button } from "@/components/ui/button"; // Adjust path for Button component
import { Input } from "@/components/ui/input"; // Adjust path for Input component
import { Textarea } from "@/components/ui/textarea"; // Adjust path for Textarea component

import AddQuestion from "@/mycomponents/addquestion"; // Adjust path for AddQuestion component
import { Dialog } from "@/components/ui/dialog";
import QuestionsList from "@/mycomponents/questionlist";

interface Story {
  title: string;
  description: string;
}

const EditStory: React.FC = () => {
  const { q_Id } = useParams(); // Get the story ID using useParams
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
  const [saving, setSaving] = useState(false); // State for save button

  useEffect(() => {
    if (!q_Id) return;

    const fetchStory = async () => {
      try {
        const storyRef = doc(db, "stories", q_Id as string);
        const storySnapshot = await getDoc(storyRef);

        if (storySnapshot.exists()) {
          setStory(storySnapshot.data() as Story);
        } else {
          setError("Story not found.");
        }
      } catch (error) {
        setError("Failed to fetch story.");
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [q_Id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!story || !q_Id) return;

    setSaving(true);

    try {
      const storyRef = doc(db, "stories", q_Id as string);
      await updateDoc(storyRef, {
        title: story.title,
        description: story.description,
      });
      alert("Story updated successfully!");
    } catch (error) {
      console.error("Error updating story:", error);
      alert("Failed to update the story.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const handleModalClose = () => {
    setIsModalOpen(false); // Close the modal when done
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Edit Story</h1>

      <form className="space-y-6" onSubmit={handleSave}>
        <div className="space-y-2">
          <label htmlFor="title" className="block text-lg font-medium">Story Title</label>
          <Input
            id="title"
            value={story?.title || ""}
            onChange={(e) => setStory({ ...story!, title: e.target.value })}
            placeholder="Enter story title"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block text-lg font-medium">Story Description</label>
          <Textarea
            id="description"
            value={story?.description || ""}
            onChange={(e) => setStory({ ...story!, description: e.target.value })}
            placeholder="Enter story description"
            required
            className="h-32"
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button onClick={() => window.history.back()}>Cancel</Button>
          <Button type="submit" variant="outline" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

      {/* Button to open the Add Question modal */}
      <Button onClick={() => setIsModalOpen(true)}>Add Question</Button>

      {/* Add Question Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => setIsModalOpen(open)}>
        <AddQuestion storyId={q_Id as string} onClose={handleModalClose} />
      </Dialog>
      <QuestionsList storyId={q_Id as string} />
    </div>
  );
};

export default EditStory;
