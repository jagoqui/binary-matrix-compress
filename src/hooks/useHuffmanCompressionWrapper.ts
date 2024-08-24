import { useState, useEffect } from "react";
import { useHuffmanCompression } from "@/hooks/useHuffmanCompression";

export const useHuffmanCompressionWrapper = (input: string, mode: "compress" | "decompress") => {
  const [internalInput, setInternalInput] = useState<string>(input);
  const [internalMode, setInternalMode] = useState<"compress" | "decompress">(mode);
  const { codeBook, output } = useHuffmanCompression(internalInput, internalMode);

  useEffect(() => {
    setInternalInput(input);
  }, [input]);

  useEffect(() => {
    setInternalMode(mode);
  }, [mode]);

  return { codeBook, output, setInternalInput, setInternalMode };
};
