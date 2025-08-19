'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area'; // Import shadcn ScrollArea
import GeneratedStoryRenderer from './generatedstory';

type GeneratedStoryDialogProps = {
  storyId: string;
};

export const GeneratedStoryDialog: React.FC<GeneratedStoryDialogProps> = ({ storyId }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openDialog = () => setIsOpen(true);
  const closeDialog = () => setIsOpen(false);

  return (
    <div>
      {/* Button to trigger the dialog */}
      <Button
        onClick={openDialog}
        className="bg-orange-600 text-white hover:bg-orange-700"
      >
        Show Story Progress
      </Button>

      {/* Dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          {/* Dialog Container */}
          <div
            className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full"
            style={{
              maxHeight: '80vh', // Limits the height for scrolling
              height: 'auto', // Ensures content doesn't overflow unnecessarily
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Story Progress</h2>
              <button
                onClick={closeDialog}
                className="text-gray-600 hover:text-gray-800"
              >
                ✖
              </button>
            </div>
            {/* Scrollable Content */}
            <ScrollArea
              className="h-[65vh] rounded-md border border-gray-200 p-2"
            >
              <GeneratedStoryRenderer storyId={storyId} />
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
};
