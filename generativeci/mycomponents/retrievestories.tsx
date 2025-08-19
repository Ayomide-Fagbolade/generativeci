"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/app/firebase/config"; // Firebase Firestore instance
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore"; // Firestore methods
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // ShadCN UI components
import { Button } from "@/components/ui/button"; // UI button
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"; // ShadCN Accordion components
import { useRouter } from "next/navigation"; // For navigation
import Link from "next/link"; // Next.js Link for navigation
import { FaPen, FaTrashAlt, FaArrowRight } from "react-icons/fa"; // React Icons

export function RetrieveStory() {
  const [stories, setStories] = useState<any[]>([]); // State for stories
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const router = useRouter();

  // Fetch stories from Firestore
  const fetchStories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "stories")); // Fetch all documents from "stories"
      const storiesList: any[] = [];

      querySnapshot.forEach((doc) => {
        storiesList.push({ id: doc.id, ...doc.data() }); // Add document data and ID
      });

      setStories(storiesList); // Update state with stories
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Delete a story
  const handleDeleteStory = async (id: string) => {
    try {
      await deleteDoc(doc(db, "stories", id)); // Delete document
      setStories(stories.filter((story) => story.id !== id)); // Remove from state
      console.log("Story deleted:", id);
    } catch (error) {
      console.error("Error deleting story:", error);
    }
  };

  // Navigate to Edit Story
  const handleEditStory = (id: string) => {
    router.push(`/admindashboard/editstoryquestions/${id}`); // Push to edit page
  };

  // Fetch stories on mount
  useEffect(() => {
    fetchStories();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      {/* Loading State */}
      {loading ? (
        <div>Loading stories...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {stories.map((story) => (
            <Card key={story.id} className="w-full">
              <CardContent>
                {/* Accordion for Description */}
                <Accordion type="single" collapsible>
                  <AccordionItem value={story.id}>
                    <AccordionTrigger className="text-xl font-semibold text-gray-800 hover:text-gray-600 flex justify-between items-center">
                      <span>{story.title}</span>
                      <div className="flex items-center space-x-2">
                        {/* Edit Button */}
                        <Button
                          variant="link"
                          size="icon"
                          className="text-gray-600 hover:text-gray-800"
                          onClick={() => handleEditStory(story.id)}
                        >
                          <FaPen />
                        </Button>
                        {/* Delete Button */}
                        <Button
                          variant="link"
                          size="icon"
                          className="text-gray-600 hover:text-red-600"
                          onClick={() => handleDeleteStory(story.id)}
                        >
                          <FaTrashAlt />
                        </Button>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-600">{story.description}</p>
                      {/* View Results Link */}
                      <div className="mt-4">
                        <Link
                          href={`/admindashboard/storyresults/${story.id}`}
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <span>View Results</span>
                          <FaArrowRight className="ml-2" />
                        </Link>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
