'use client';

import { useEffect, useState } from "react";
import { db } from "@/app/firebase/config"; // Firebase Firestore instance
import { collection, getDocs } from "firebase/firestore"; // Firestore methods

export default function StoryVotingPage() {
  const [stories, setStories] = useState<any[]>([]); // State to store all stories
  const [loading, setLoading] = useState<boolean>(true); // Loading state

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "stories")); // Fetch all documents in the "stories" collection
        const storiesList: any[] = [];

        querySnapshot.forEach((doc) => {
          storiesList.push({ id: doc.id, ...doc.data() }); // Add each story to the list
        });

        setStories(storiesList); // Update state with the list of stories
      } catch (error) {
        console.error("Error fetching stories:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching completes
      }
    };

    fetchStories();
  }, []);

  if (loading) return <div>Loading stories...</div>; // Show loading indicator while fetching
  if (stories.length === 0) return <div>No stories found!</div>; // Handle case where no stories are found

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Vote for Your Favorite Story</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {stories.map((story) => (
          <div
            key={story.id}
            className="p-4 border rounded shadow hover:shadow-lg cursor-pointer transition-shadow"
            onClick={() => console.log(`Voted for story with ID: ${story.id}`)} // Replace with voting logic
          >
            <h2 className="text-xl font-semibold mb-2">{story.title}</h2>
            <p className="text-gray-700">{story.description.substring(0, 100)}...</p>
          </div>
        ))}
      </div>
    </div>
  );
}
