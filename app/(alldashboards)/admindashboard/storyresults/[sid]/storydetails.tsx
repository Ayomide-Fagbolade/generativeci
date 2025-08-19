import { useState, useEffect } from "react";
import { db } from "@/app/firebase/config"; // Firebase Firestore instance
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button"; // Assuming Button component from ShadCN
import { callHuggingFaceModel } from "./huggingface";
import { Textarea } from "@/components/ui/textarea";

type Section = {
  title: string;
  content: string[];
};

type CurriculumDocument = {
  mainTitle: string;
  sections: Section[];
};

const StoryDetails = ({ storyId }: { storyId: string }) => {
  const [story, setStory] = useState<{ title: string; description: string } | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState<CurriculumDocument | null>(null);
  const [editedText, setEditedText] = useState<string[][]>([]); // Tracks edited content for each section
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0); // To track the carousel index
  const [editedTitle, setEditedTitle] = useState<string>(''); // Track the editable title
  const [editedSectionTitles, setEditedSectionTitles] = useState<string[]>([]); // Track the edited section titles

  useEffect(() => {
    const fetchStoryDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const storyDocRef = doc(db, "stories", storyId);
        const storyDoc = await getDoc(storyDocRef);

        if (!storyDoc.exists()) {
          setError("Story not found.");
          setLoading(false);
          return;
        }

        const storyData = storyDoc.data();
        setStory(storyData);

        const questionsCollectionRef = collection(db, "stories", storyId, "questions");
        const questionsSnapshot = await getDocs(questionsCollectionRef);

        const questionsData = questionsSnapshot.docs.map((questionDoc) => {
          const questionData = questionDoc.data();
          return {
            question: questionData.question,
            options: questionData.options,
            highestVotedOptions: questionData.options.filter(
              (option) => option.votes === Math.max(...questionData.options.map((opt) => opt.votes))
            ),
          };
        });

        setQuestions(questionsData);

        const generatedText = await callHuggingFaceModel(storyData.title, storyData.description, questionsData);
        setGeneratedText(generatedText);

        // Initialize editedText state based on the generated text
        if (generatedText) {
          const initialContent = generatedText.sections.map((section) => section.content);
          setEditedText(initialContent);
          setEditedTitle(generatedText.mainTitle); // Set the editable title
          setEditedSectionTitles(generatedText.sections.map((section) => section.title)); // Initialize section titles
        }

      } catch (err) {
        console.error("Error fetching story details:", err);
        setError("Failed to fetch story details.");
      } finally {
        setLoading(false);
      }
    };

    fetchStoryDetails();
  }, [storyId]);

  const handleTextChange = (sectionIndex: number, paragraphIndex: number, newText: string) => {
    setEditedText((prevState) => {
      const updatedText = [...prevState];
      updatedText[sectionIndex][paragraphIndex] = newText;
      return updatedText;
    });
  };

  const handleTitleChange = (newText: string) => {
    setEditedTitle(newText); // Update the title
  };

  const handleSectionTitleChange = (sectionIndex: number, newTitle: string) => {
    const updatedTitles = [...editedSectionTitles];
    updatedTitles[sectionIndex] = newTitle;
    setEditedSectionTitles(updatedTitles); // Update section title
  };

  const handleSubmit = async () => {
    if (!generatedText) return;

    // Filter out empty text areas
    const generatedStory = editedText.flat().filter(text => text.trim() !== '');
    if (!editedTitle.trim()) return; // Don't submit if the title is empty

    try {
      // Update the generated_story subcollection in Firestore
      const generatedStoryRef = collection(db, "stories", storyId, "generated_story");
      await setDoc(doc(generatedStoryRef, "content"), { 
        generatedTitle: editedTitle,
        generatedStory,
        sectionTitles: editedSectionTitles // Include the updated section titles
      });
      alert("Story content updated successfully!");
    } catch (err) {
      console.error("Error submitting generated story:", err);
      alert("Failed to update the story content.");
    }
  };

  const handleCarouselChange = (direction: "next" | "prev") => {
    setCurrentSectionIndex((prevIndex) => {
      if (direction === "next" && prevIndex < (generatedText?.sections.length || 0) - 1) {
        return prevIndex + 1;
      } else if (direction === "prev" && prevIndex > 0) {
        return prevIndex - 1;
      }
      return prevIndex; // No change if we're at the boundaries
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <Skeleton className="h-6 w-64 mb-2" />
          <Skeleton className="h-4 w-3/5 mb-4" />
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Story and Questions (Editable)</CardTitle>
      </CardHeader>
      <CardContent>
        {generatedText && (
          <div>
            {/* Editable Title */}
            <h2 className="mt-4">Edit Title</h2>
            <Textarea
              value={editedTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Edit Story Title"
              className="w-full mb-4"
              style={{ height: "80px" }} // Reasonable height for title editing
            />

            <div className="carousel-container">
              <Button onClick={() => handleCarouselChange("prev")} disabled={currentSectionIndex === 0}>Previous</Button>
              <div className="carousel">
                {/* Editable Section Title */}
                <Textarea
                  value={editedSectionTitles[currentSectionIndex]}
                  onChange={(e) => handleSectionTitleChange(currentSectionIndex, e.target.value)}
                  placeholder={`Edit Section Title`}
                  className="w-full mb-4"
                  style={{ height: "50px" }} // Reasonable height for section title editing
                />
                
                {generatedText.sections[currentSectionIndex]?.content.map((paragraph, paragraphIndex) => (
                  <div key={paragraphIndex} className="mb-4">
                    <Textarea
                      value={editedText[currentSectionIndex]?.[paragraphIndex] || paragraph}
                      onChange={(e) => handleTextChange(currentSectionIndex, paragraphIndex, e.target.value)}
                      placeholder={`Edit ${generatedText.sections[currentSectionIndex]?.title} - Paragraph ${paragraphIndex + 1}`}
                      className="w-full"
                      style={{ height: "100px" }} // Reasonable height for paragraph editing
                    />
                  </div>
                ))}
              </div>
              <Button onClick={() => handleCarouselChange("next")} disabled={currentSectionIndex === (generatedText?.sections.length || 1) - 1}>Next</Button>
            </div>
            <Button onClick={handleSubmit} className="mt-4">Submit Changes</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StoryDetails;
