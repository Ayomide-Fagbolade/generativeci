import { useState, useEffect } from "react";
import { db } from "@/app/firebase/config"; // Firebase Firestore instance
import { doc, getDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

type GeneratedStory = {
  generatedTitle: string;
  generatedStory: string[];
  sectionTitles: string[];
};

const GeneratedStoryRenderer = ({ storyId }: { storyId: string }) => {
  const [generatedStoryData, setGeneratedStoryData] = useState<GeneratedStory | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGeneratedStory = async () => {
      setLoading(true);
      setError(null);

      try {
        const generatedStoryDocRef = doc(db, "stories", storyId, "generated_story", "content");
        const generatedStoryDoc = await getDoc(generatedStoryDocRef);

        if (!generatedStoryDoc.exists()) {
          setError("Generated story not found.");
          setLoading(false);
          return;
        }

        const generatedStoryData = generatedStoryDoc.data() as GeneratedStory;
        setGeneratedStoryData(generatedStoryData);
      } catch (err) {
        console.error("Error fetching generated story:", err);
        setError("Failed to fetch generated story.");
      } finally {
        setLoading(false);
      }
    };

    fetchGeneratedStory();
  }, [storyId]);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!generatedStoryData) {
    return null; // No data case
  }

  // Preview and full story handling
  const previewParagraphs = generatedStoryData.generatedStory.slice(0, 2); // Show first 2 paragraphs in preview
  const fullStoryParagraphs = generatedStoryData.generatedStory;

  const storyParagraphs = isExpanded ? fullStoryParagraphs : previewParagraphs;

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-extrabold text-black mb-6">
        {generatedStoryData.generatedTitle}
      </h2>
      <div className="text-gray-700 leading-relaxed space-y-4">
        {storyParagraphs.map((paragraph, index) => (
          <p key={index} className="text-gray-700">
            {paragraph}
          </p>
        ))}
      </div>
      {generatedStoryData.generatedStory.length > 2 && (
        <button
          onClick={toggleExpand}
          className="mt-4 text-orange-600 font-semibold underline"
        >
          {isExpanded ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
};

export default GeneratedStoryRenderer;
