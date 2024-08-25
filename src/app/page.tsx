"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MatrixEditor from "@/components/MatrixEditor";
import MatrixCanvas from "@/components/MatrixCanvas";
import CompressionResult from "@/components/CompressionResult";
import { useHuffmanCompressionWrapper } from "@/hooks/useHuffmanCompressionWrapper";

const HuffmanCompression: React.FC = () => {
  // Define the default input values for each mode
  const defaultCompressInput = "DA705\n00111100\n01111110\n11011011\n11111111\n11011011\n01100110\n00111100";
  const defaultDecompressInput = ""; // Default value for decompression if needed

  // State for input and mode
  const [input, setInput] = useState<string>(defaultCompressInput);
  const [mode, setMode] = useState<"compress" | "decompress">("compress");
  const { setInternalInput, setInternalMode, codeBookRGB, outputRGB } = useHuffmanCompressionWrapper(input, mode);

  // Load the input from localStorage based on the current mode
  useEffect(() => {
    const storedInput = localStorage.getItem(`matrixInput_${mode}`);
    setInput(storedInput !== null ? storedInput : (mode === "compress" ? defaultCompressInput : defaultDecompressInput));
  }, [mode]);

  // Save the input to localStorage whenever it changes and on mode change
  useEffect(() => {
    localStorage.setItem(`matrixInput_${mode}`, input);
  }, [input, mode]);

  const handleButtonClick = () => {
    setInternalInput(input);
    setInternalMode(mode);
  };

  return (
    <div className="flex flex-col space-y-4 p-4">
      <Tabs value={mode} onValueChange={(value) => setMode(value as "compress" | "decompress")}>
        <TabsList>
          <TabsTrigger value="compress">Comprimir</TabsTrigger>
          <TabsTrigger value="decompress">Descomprimir</TabsTrigger>
        </TabsList>
        <TabsContent value="compress">
          <MatrixEditor input={input} setInput={setInput} mode="compress" onButtonClick={handleButtonClick} />
        </TabsContent>
        <TabsContent value="decompress">
          <MatrixEditor input={input} setInput={setInput} mode="decompress" onButtonClick={handleButtonClick} />
        </TabsContent>
        <p><strong>Longitud:</strong> {input.length}</p>
      </Tabs>
      <strong>{mode === "compress" ? 'Compresión' : 'Descompresión'} RGB</strong>
      <MatrixCanvas matrix={mode === "compress" ? input : outputRGB} />
      <CompressionResult codeBook={codeBookRGB} output={outputRGB} />
    </div>
  );
};

export default HuffmanCompression;
