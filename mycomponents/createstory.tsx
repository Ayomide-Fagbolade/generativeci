"use client"
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/app/firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { FaPlus } from "react-icons/fa";

export function CreateStory() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null); // Handle errors
  const router = useRouter();

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Reset error on new submission

    try {
      const storyRef = await addDoc(collection(db, "stories"), {
        title,
        description,
        createdAt: new Date(),
      });
      router.push(`/admindashboard/editstoryquestions/${storyRef.id}`);
      setOpen(false); // Close modal after success
    } catch (error) {
      console.error("Error creating story:", error);
      setError("Failed to create story. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {/* Adjust button size and style */}
          <Button
            variant="destructive"
            size="default" // Medium size button (adjust if needed)
            className="flex items-center justify-center gap-3"
          >
            <FaPlus className="h-5 w-5" />
            Create Story
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-sm mx-auto flex flex-col bg-white rounded-lg  p-6">
          <DialogHeader>
            <DialogTitle>Create New Story</DialogTitle>
          </DialogHeader>

          {/* Show error if any */}
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

          <form onSubmit={handleCreateStory} className="flex flex-col gap-6 flex-1">
            <div className="space-y-4 overflow-y-auto flex-1">
              {/* Story Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Story Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter story title"
                  required
                />
              </div>

              {/* Story Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Story Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter story description"
                  required
                  className="h-32"
                />
              </div>
            </div>

            {/* Button section */}
            <div className="flex gap-2 justify-end mt-auto">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {loading ? "Creating..." : "Create Story"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
