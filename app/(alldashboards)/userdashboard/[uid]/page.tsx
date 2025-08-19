'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; // For route params and navigation
import { db } from "@/app/firebase/config"; // Firebase Firestore instance
import { collection, getDocs } from "firebase/firestore"; // Firestore methods
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function StoryVotingPage() {
  const { uid } = useParams(); // Retrieve the user ID from the route
  const [stories, setStories] = useState<any[]>([]); // State to store all stories
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const router = useRouter(); // For navigation

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
          <Card
            key={story.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(`/userdashboard/${uid}/${story.id}/vote/`)} // Navigate to voting page
          >
            <CardHeader>
              <CardTitle className="text-xl font-semibold">{story.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                {story.description.substring(0, 100)}...
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent parent onClick
                  router.push(`/userdashboard/${uid}/${story.id}/vote/`);
                }}
              >
                Vote Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
