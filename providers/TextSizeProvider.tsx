import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const TEXT_SIZE_KEY = "@text_size";

type TextSize = "sm" | "md" | "lg";

interface TextSizeContextValue {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
}


const TextSizeContext = createContext<TextSizeContextValue | null>(null);

export function TextSizeProvider({ children }: { children: React.ReactNode }) {
  const [textSize, setTextSize] = useState<TextSize>("md");
  
  useEffect(() => {
    AsyncStorage.getItem(TEXT_SIZE_KEY).then((savedSize) => {
      if (
        savedSize === "sm" ||
        savedSize === "md" ||
        savedSize === "lg"
      ) {
        setTextSize(savedSize);
      }
    });
  }, []);

  const handleSetTextSize = (newSize: TextSize) => {
    setTextSize(newSize);
    AsyncStorage.setItem(TEXT_SIZE_KEY, newSize);
  };

  return (
    <TextSizeContext.Provider value={{ textSize, setTextSize: handleSetTextSize }}>
      {children}
    </TextSizeContext.Provider>
  );
}

export function useTextSize() {
  const context = useContext(TextSizeContext);
  if (!context) {
    throw new Error("useTextSize must be used within a TextSizeProvider");
  }
  return context;
}

/* Code adapted from ThemeProvider.tsx by Simon Manzler */