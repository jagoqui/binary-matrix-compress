"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MatrixEditor from "@/components/MatrixEditor";
import MatrixCanvas from "@/components/MatrixCanvas";
import CompressionResult from "@/components/CompressionResult";
import { useHuffmanCompressionWrapper } from "@/hooks/useHuffmanCompressionWrapper";

const HuffmanCompression: React.FC = () => {
  const [input, setInput] = useState<string>("da705\n00111100\n01111110\n11011011\n11111111\n11011011\n01100110\n00111100");
  const [mode, setMode] = useState<"compress" | "decompress">("compress");
  const { codeBook, output, setInternalInput, setInternalMode } = useHuffmanCompressionWrapper(input, mode);

  const handleButtonClick = () => {
    // Add your compression/decompression logic here
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
      <MatrixCanvas matrix={mode === "compress" ? input : output} />
      <CompressionResult codeBook={codeBook} output={output} />
    </div>
  );
};

export default HuffmanCompression;

