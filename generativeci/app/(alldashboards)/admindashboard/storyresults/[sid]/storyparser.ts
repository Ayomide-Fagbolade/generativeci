type Section = {
    title: string;
    content: string[];
  };
  
  type ParsedContent = {
    mainTitle: string;
    sections: Section[];
  };
  
  /**
   * Parses a structured text input to extract the main title,
   * section titles, and their associated content.
   * 
   * @param input - The structured text input to parse.
   * @returns An object containing the main title and an array of sections.
   * @throws Error if the input is invalid or not a string.
   */
  export function parseContent(input: string | undefined): ParsedContent {
    if (typeof input !== "string" || input.trim().length === 0) {
      throw new Error("Invalid input: Expected a non-empty string.");
    }
  
    // Split the text into lines and remove any extraneous whitespace
    const lines = input.split("\n").map(line => line.trim()).filter(line => line.length > 0);
  
    let mainTitle = "";
    const sections: Section[] = [];
  
    let currentSection: Section | null = null;
  
    lines.forEach(line => {
      if (line.startsWith("**") && line.endsWith("**")) {
        // If a line is wrapped in **, it's a section title
        if (currentSection) {
          // Push the previous section if one exists
          sections.push(currentSection);
        }
        currentSection = { title: line.replace(/\*\*/g, ""), content: [] };
      } else if (!mainTitle) {
        // If we haven't assigned the main title yet, use the first line
        mainTitle = line;
      } else if (currentSection) {
        // Add content to the current section
        currentSection.content.push(line);
      }
    });
  
    // Push the last section if it exists
    if (currentSection) {
      sections.push(currentSection);
    }
  
    return { mainTitle, sections };
  }
  