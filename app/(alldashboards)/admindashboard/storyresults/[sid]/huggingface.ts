import essayContent from "./essaystyle";
import { parseContent } from "./storyparser";

export const query = async (data) => {
    try {
      console.log("Sending data to Hugging Face API:", data); // Log the input data

      const response = await fetch("https://api-inference.huggingface.co/models/google/gemma-2-2b-it", {
        headers: {
          Authorization: "Bearer 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",  // Replace with your token
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
      });

      console.log("Received response status:", response.status); // Log the response status

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();

      console.log("Received result from API:", result); // Log the result

      if (result.error) {
        throw new Error(`API Error: ${result.error}`);
      }

      const generatedText = result[0].generated_text.split("###")[1] as string;
      console.log("Extracted generated text:", generatedText); // Log the extracted text
      

      return generatedText;

    } catch (error) {
      console.error("Error fetching data from Hugging Face API:", error);
      return { generated_text: "An error occurred. Please try again." };
    }
  };

  export const callHuggingFaceModel = async (title, description, questions) => {
    // Create the prompt data for the model
    const promptData = {
      inputs: `
        Imagine you are giving a expository essay about ${title}   ${description} .A guide is provided in ${essayContent} but yours should be on the level of a linguistic professor targeted to be read by the whole university community. the story should be titled ${title}.  focus on  the following themes and strictly adhere to the mainpoints provided for each theme with each developed into a single paragraph 
         
  
        
        ${questions
          .map(
            (question, index) => `
            ${index + 1}. Theme: ${question.question}
               - mainpoint: ${question.highestVotedOptions[0]?.text }
          `
          )
          .join("\n")} 
          now generate the expository essay of 5 paragraphs max each one representing a theme .ensure that the essay is well structured and coherent and cannot be traced to AI. Let the story be such that each paragraph is separated with a double star symbol.
          ###

      `,
    };

    console.log("Prepared prompt data:", promptData); // Log the prepared prompt data

    // Call the query function with the prepared prompt data
    const response = await query(promptData);

    console.log("Generated response from Hugging Face API:", response); // Log the generated response
    const parsedcon= await parseContent(response as string);
    console.log("Parsed response from Hugging Face API:", parsedcon); // Log the generated response

    // Return the generated text from the API response
    return parsedcon  || "No generated text returned.";
  };
