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

// Construcción del árbol de Huffman
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

// Construcción del mapa de códigos Huffman
const buildHuffmanCodeMap = (root: HuffmanNode, prefix = '', codeMap: CodeMap = {}): CodeMap => {
  if (root.character !== undefined) {
    codeMap[root.character] = prefix;
  }
  if (root.left) buildHuffmanCodeMap(root.left, prefix + '0', codeMap);
  if (root.right) buildHuffmanCodeMap(root.right, prefix + '1', codeMap);
  return codeMap;
};

// Codificación del mapa de códigos Huffman
const encodeCodeMap = (codeMap: CodeMap): string => {
  return Object.entries(codeMap)
    .map(([char, code]) => {
      const charBinary = char.charCodeAt(0).toString(2).padStart(8, '0');
      const codeLength = code.length.toString(2).padStart(8, '0');
      return `${charBinary}${codeLength}${code}`;
    })
    .join('');
};

// Decodificación del mapa de códigos Huffman
const decodeCodeMap = (codeMapBinary: string): CodeMap => {
  const codeMap: CodeMap = {};
  let index = 0;

  while (index < codeMapBinary.length) {
    const charBinary = codeMapBinary.slice(index, index + 8);
    index += 8;
    const char = String.fromCharCode(parseInt(charBinary, 2));

    const lengthBinary = codeMapBinary.slice(index, index + 8);
    index += 8;
    const length = parseInt(lengthBinary, 2);

    const code = codeMapBinary.slice(index, index + length);
    index += length;

    codeMap[char] = code;
  }
  return codeMap;
};

// Función para comprimir el texto usando Huffman
const compressHuffman = (input: string): string => {
  const frequencies = input.split('').reduce((acc, char) => {
    acc[char] = (acc[char] || 0) + 1;
    return acc;
  }, {} as { [char: string]: number });

  const root = buildHuffmanTree(frequencies);
  const codeMap = buildHuffmanCodeMap(root);
  const encodedMap = encodeCodeMap(codeMap);
  const encodedInput = input.split('').map(char => codeMap[char]).join('');
  return encodedMap + '00000000' + encodedInput;
};

// Función para descomprimir el texto usando Huffman
const decompressHuffman = (encoded: string, codeMap: CodeMap): string => {
  const reversedCodeMap = Object.fromEntries(Object.entries(codeMap).map(([k, v]) => [v, k]));
  let currentCode = '';
  let decoded = '';

  for (const bit of encoded) {
    currentCode += bit;
    if (reversedCodeMap[currentCode]) {
      decoded += reversedCodeMap[currentCode];
      currentCode = '';
    }
  }
  return decoded;
};

// Componente React para manejar la compresión y descompresión
const HuffmanCompression: React.FC = () => {
  const [input, setInput] = useState<string>(`da705\n00111100\n01111110\n11011011\n11111111\n11011011\n01100110\n00111100
`);
  const [output, setOutput] = useState<string>("");
  const [mode, setMode] = useState<"compress" | "decompress">("compress");
  const [codeMap, setCodeMap] = useState<CodeMap>({});
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleProcess = () => {
    if (mode === "compress") {
      const compressed = compressHuffman(input);
      const mapEndIndex = compressed.indexOf('00000000');
      const encodedMap = compressed.slice(0, mapEndIndex);
      const binaryData = compressed.slice(mapEndIndex + 8);
      setCodeMap(decodeCodeMap(encodedMap));
      setOutput(binaryData);
    } else {
      const decompressed = decompressHuffman(input, codeMap);
      setOutput(decompressed);
    }
  };

  const drawMatrix = (matrix: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rows = matrix.split("\n");
    const cellSize = 20;
    const fontSize = 12;
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
        ctx.fillText(row, 0, (y + 1) * cellSize - (cellSize - fontSize) / 2);
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
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>{mode === "compress" ? "Datos Comprimidos (Binario)" : "Matriz Descomprimida"}</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-secondary p-2 rounded overflow-x-auto">{output}</pre>
          <p>Bytes de entrada: {input.length}</p>
          <p>Bytes de salida: {output.length}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visualización de la Matriz</CardTitle>
        </CardHeader>
        <CardContent>
          <canvas ref={canvasRef} className="border border-gray-300" />
        </CardContent>
      </Card>

      {mode === "compress" && (
        <Card>
          <CardHeader>
            <CardTitle>Mapa de Códigos Huffman</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-secondary p-2 rounded overflow-x-auto">
              {JSON.stringify(codeMap, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HuffmanCompression;
