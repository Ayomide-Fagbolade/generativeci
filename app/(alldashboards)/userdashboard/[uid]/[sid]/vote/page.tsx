"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "@/app/firebase/config";
import Voting from "./voting";
import Results from "@/mycomponents/results";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { CardFooter } from "@/components/ui/card";

import Link from "next/link";
import GeneratedStoryRenderer from "@/mycomponents/generatedstory";
import { GeneratedStoryDialog } from "@/mycomponents/generateStoryDialog";

type Option = {
  text: string;
  votes: number;
};

type Questions = {
  id: string;
  question: string;
  options: Option[];
};

type Story = {
  title: string;
  description: string;
};

const SHARD_COUNT = 10; // Define the number of shards per option

const VotingPage = () => {
  const params = useParams();
  const sid = params.sid as string; // Explicitly cast to string
  const uid = params.uid as string; // Explicitly cast to string

  const [story, setStory] = useState<Story | null>(null);
  const [questions, setQuestions] = useState<Questions[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);

  const userId = uid; // Replace with actual authenticated user ID

  useEffect(() => {
    const fetchStoryAndCheckVoter = async () => {
      if (!sid) {
        setError("No story ID provided.");
        setLoading(false);
        return;
      }

      try {
        // Fetch Story
        const storyDocRef = doc(db, "stories", sid);
        const storyDoc = await getDoc(storyDocRef);

        if (storyDoc.exists()) {
          const storyData = storyDoc.data();
          setStory(storyData as Story);

          // Fetch Questions
          const questionsCollectionRef = collection(storyDocRef, "questions");
          const questionsSnapshot = await getDocs(questionsCollectionRef);

          const questionsList = questionsSnapshot.docs.map((doc) => ({
            id: doc.id,
            question: doc.data().question,
            options: doc.data().options || [],
          }));

          setQuestions(questionsList);
        } else {
          setError("Story not found.");
          setLoading(false);
          return;
        }

        // Check if User ID exists in votersDetails collection
        const votersDetailsRef = collection(db, `stories/${sid}/votersDetails`);
        const voterDocRef = doc(votersDetailsRef, userId);
        const voterDoc = await getDoc(voterDocRef);

        if (voterDoc.exists()) {
          setHasVoted(true); // User has already voted
        }
      } catch (err) {
        console.error("Error fetching story or voter details:", err);
        setError("Error loading the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchStoryAndCheckVoter();
  }, [sid, userId]);

  if (loading) return <div>Loading story...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!story) return <div>No story found.</div>;

  return (
    <>
      {hasVoted ? (
        <>
        <div className="flex justify-center items-center w-full mt-6">
          <Card className="w-full max-w-5xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Check Your Story Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-100 text-lg">
              Imagine your impact on the story of UM6P in 2030. Your votes and ideas are
              crafting a collective vision for the future. Let your voice be heard and
              contribute to this shared narrative.
              </p>
            </CardContent>
            <CardFooter>
              <Link href={`/userdashboard/${uid}/${sid}/recentstory`} passHref>
                <Button
                  variant="secondary"
                  className="w-full bg-white text-orange-600 hover:bg-orange-100 hover:text-orange-700"
                >
                  View Story Progress
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
        <div>
           <Card className="w-full max-w-5xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Check Your Voting Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-100 text-lg">
              Discover how others have been voting and shaping the story of UM6P in 2030. 
              Explore the collective decisions and see which ideas are leading the way.
              </p>
            </CardContent>
            <CardFooter>
              <Link href={`/userdashboard/${uid}/${sid}/voteprogress`} passHref>
                <Button
                  variant="secondary"
                  className="w-full bg-white text-orange-600 hover:bg-orange-100 hover:text-orange-700"
                >
                  See How Others Have Been Voting
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
        </>
      )
      : (
        <div className="voting-container">
          <Voting uid={uid} sid={sid} questions={questions} />
        </div>
      )}
    </>
  );
  
};

export default VotingPage;
