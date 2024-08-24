"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Interfaces para nodos de Huffman y mapa de códigos
interface HuffmanNode {
  character?: string;
  frequency: number;
  left?: HuffmanNode;
  right?: HuffmanNode;
}

interface CodeMap {
  [character: string]: string;
}

const buildHuffmanTree = (frequencies: { [char: string]: number }): HuffmanNode => {
  const nodes: HuffmanNode[] = Object.entries(frequencies).map(([char, freq]) => ({
    character: char,
    frequency: freq,
  }));

  while (nodes.length > 1) {
    nodes.sort((a, b) => a.frequency - b.frequency);
    const left = nodes.shift()!;
    const right = nodes.shift()!;
    const merged: HuffmanNode = {
      frequency: left.frequency + right.frequency,
      left,
      right,
    };
    nodes.push(merged);
  }

  return nodes[0];
};

const buildHuffmanCodeMap = (root: HuffmanNode, prefix = '', codeMap: CodeMap = {}): CodeMap => {
  if (root.character !== undefined) {
    codeMap[root.character] = prefix;
  }
  if (root.left) buildHuffmanCodeMap(root.left, prefix + '0', codeMap);
  if (root.right) buildHuffmanCodeMap(root.right, prefix + '1', codeMap);
  return codeMap;
};

const encodeCodeMap = (codeMap: CodeMap): string => {
  const codeEntries = Object.entries(codeMap).map(([char, code]) => {
    const charBinary = char.charCodeAt(0).toString(2).padStart(8, '0');
    const codeLength = code.length.toString(2).padStart(8, '0');
    return `${charBinary}${codeLength}${code}`;
  });

  const totalLengthBinary = (codeEntries.join('').length).toString(2).padStart(16, '0');

  return totalLengthBinary + codeEntries.join('');
};

const decodeCodeMap = (encodedMap: string): CodeMap => {
  const codeMap: CodeMap = {};
  let index = 0;
  const totalLength = parseInt(encodedMap.slice(0, 16), 2);
  index += 16;

  while (index < totalLength + 16) {
    const charBinary = encodedMap.slice(index, index + 8);
    const char = String.fromCharCode(parseInt(charBinary, 2));
    index += 8;

    const lengthBinary = encodedMap.slice(index, index + 8);
    const length = parseInt(lengthBinary, 2);
    index += 8;

    const code = encodedMap.slice(index, index + length);
    index += length;

    codeMap[char] = code;
  }
  return codeMap;
};

const compressHuffman = (input: string): { encodedData: string, codeMap: CodeMap } => {
  const frequencies = input.split('').reduce((acc, char) => {
    acc[char] = (acc[char] || 0) + 1;
    return acc;
  }, {} as { [char: string]: number });

  const root = buildHuffmanTree(frequencies);
  const codeMap = buildHuffmanCodeMap(root);
  const encodedMap = encodeCodeMap(codeMap);
  const encodedInput = input.split('').map(char => codeMap[char]).join('');
  return { encodedData: encodedMap + encodedInput, codeMap };
};

const decompressHuffman = (encoded: string): { decodedData: string, codeMap: CodeMap } => {
  const mapEndIndex = 16 + parseInt(encoded.slice(0, 16), 2);
  const encodedMap = encoded.slice(0, mapEndIndex);
  const binaryData = encoded.slice(mapEndIndex);

  const codeMap = decodeCodeMap(encodedMap);
  const reversedCodeMap = Object.fromEntries(Object.entries(codeMap).map(([k, v]) => [v, k]));

  let currentCode = '';
  let decoded = '';

  for (const bit of binaryData) {
    currentCode += bit;
    if (reversedCodeMap[currentCode]) {
      decoded += reversedCodeMap[currentCode];
      currentCode = '';
    }
  }
  return { decodedData: decoded, codeMap };
};

const HuffmanCompression: React.FC = () => {
  const [input, setInput] = useState<string>("da705\n00111100\n01111110\n11011011\n11111111\n11011011\n01100110\n00111100");
  const [output, setOutput] = useState<string>("");
  const [codeBook, setCodeBook] = useState<CodeMap>({});
  const [mode, setMode] = useState<"compress" | "decompress">("compress");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleProcess = () => {
    if (mode === "compress") {
      const { encodedData, codeMap } = compressHuffman(input);
      setCodeBook(codeMap);
      setOutput(encodedData);
    } else {
      const { decodedData, codeMap } = decompressHuffman(input);
      setCodeBook(codeMap);
      setOutput(decodedData);
    }
  };

  const drawMatrix = (matrix: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rows = matrix.split("\n");
    const cellSize = 30;
    const fontSize = 16;

    const maxWidth = Math.max(...rows.map(row => row.length)) * cellSize;
    canvas.width = maxWidth;
    canvas.height = rows.length * cellSize;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    rows.forEach((row, y) => {
      if (/^[01]+$/.test(row)) {
        [...row].forEach((cell, x) => {
          if (cell === "1") {
            ctx.fillStyle = "black";
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          }
        });
      } else {
        ctx.fillStyle = "black";
        ctx.font = `${fontSize}px Arial`;
        ctx.fillText(row.toUpperCase(), 0, (y + 1) * cellSize - (cellSize - fontSize) / 2);
      }
    });
  };

  useEffect(() => {
    drawMatrix(mode === "compress" ? input : output);
  }, [input, output, mode]);

  return (
    <div className="flex flex-col space-y-4 p-4">
      <Tabs value={mode} onValueChange={(value) => setMode(value as "compress" | "decompress")}>
        <TabsList>
          <TabsTrigger value="compress">Comprimir</TabsTrigger>
          <TabsTrigger value="decompress">Descomprimir</TabsTrigger>
        </TabsList>
        <TabsContent value="compress">
          <Card>
            <CardHeader>
              <CardTitle>Matriz Original</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ingrese la matriz aquí"
                rows={10}
              />
              <Button onClick={handleProcess} className="mt-2">
                Comprimir
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="decompress">
          <Card>
            <CardHeader>
              <CardTitle>Datos Comprimidos</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ingrese los datos comprimidos"
                rows={10}
              />
              <Button onClick={handleProcess} className="mt-2">
                Descomprimir
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <p><strong>Longitud:</strong> {input.length}</p>
      </Tabs>
      <div className="relative">
        <canvas ref={canvasRef} className="border border-gray-300" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Resultado</CardTitle>
        </CardHeader>
        <CardContent>
          <pre><strong>CodeBook:</strong> {JSON.stringify(codeBook, null, 2)}</pre>
          <pre><strong>Resultado:</strong> <br></br>{output}</pre>
          <p><strong>Longitud:</strong> {output.length}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HuffmanCompression;
