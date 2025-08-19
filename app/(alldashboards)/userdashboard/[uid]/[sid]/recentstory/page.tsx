'use client';
import { useParams } from 'next/navigation';
import GeneratedStoryRenderer from '@/mycomponents/generatedstory';
import React from 'react';

type Props = {};

const Page = (props: Props) => {
  const params = useParams();
  const storyId = params.sid as string; // Extract story ID from the route parameters

  if (!storyId) {
    return <div>No story ID provided.</div>;
  }

  return (
    <>
      <GeneratedStoryRenderer storyId={storyId} />
    </>
  );
};

export default Page;
