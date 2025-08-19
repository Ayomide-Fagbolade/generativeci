'use client';
import { useParams } from 'next/navigation';
import GeneratedStoryRenderer from '@/mycomponents/generatedstory';
import React from 'react';
import Results from '@/mycomponents/results';

type Props = {};

const Page = (props: Props) => {
  const params = useParams();
  const storyId = params.sid as string; // Extract story ID from the route parameters

  if (!storyId) {
    return <div>No story ID provided.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg border border-gray-300">
    <div className="story-container mb-8 text-center">
      <h1 className="text-4xl font-extrabold text-orange-600 mb-4">Life in UM6P in 2030</h1>
      <p className="text-lg text-gray-700 font-bold">Describe a day at UM6P in 2030, Your story should explore these five themes—Curriculum Innovation, Experiential Learning, Industry Partnerships, Student Satisfaction, and Career Readiness—painting a vivid picture of this dynamic and forward-thinking campus.
    </p>
    </div>
      <div className="results-container space-y-6">
        <Results storyId={storyId} />
      </div>
    </div>
  );
};

export default Page;


