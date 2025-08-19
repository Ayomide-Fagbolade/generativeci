"use client";

import { useParams } from "next/navigation";
import StoryDetails from "./storydetails";
import React from 'react'
import GeneratedStoryRenderer from "@/mycomponents/generatedstory";

type Props = {}

const StoryResult = (props: Props) => {
     // Use useParams to retrieve the storyId from the route
  const { sid } = useParams();

  // Check if the storyId exists
  if (!sid) {
    return <div className="text-red-500 text-center">Story ID is missing.</div>;
  }

    return (
        <div className="p-4">
        <GeneratedStoryRenderer storyId={sid as string} />
        <StoryDetails storyId={sid as string} />
        </div>
    );
}

export default StoryResult
