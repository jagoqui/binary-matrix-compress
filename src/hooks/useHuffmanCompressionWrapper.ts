import { useState, useEffect } from "react";
import { useOptimizeRGBHuffmanCompression } from "@/hooks/useOptimizeRGBHuffmanCompresion";

export const useHuffmanCompressionWrapper = (input: string, mode: "compress" | "decompress") => {
  const [internalInput, setInternalInput] = useState<string>(input);
  const [internalMode, setInternalMode] = useState<"compress" | "decompress">(mode);
  const { codeBook: codeBookRGB, output: outputRGB } = useOptimizeRGBHuffmanCompression(internalInput, internalMode);

  useEffect(() => {
    setInternalInput(input);
  }, [input]);

  useEffect(() => {
    setInternalMode(mode);
  }, [mode]);

  return {codeBookRGB, outputRGB };
};
