import { useEffect, useState } from "react";

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
  
export const useHuffmanCompression = (input: string, mode: "compress" | "decompress") => {
const [codeBook, setCodeBook] = useState<CodeMap>({});
const [output, setOutput] = useState<string>("");

useEffect(() => {
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

        if (mode === "compress") {
        const { encodedData, codeMap } = compressHuffman(input);
        setCodeBook(codeMap);
        setOutput(encodedData);
        } else {
        const { decodedData, codeMap } = decompressHuffman(input);
        setCodeBook(codeMap);
        setOutput(decodedData);
        }
    }, [input, mode]);

    return { codeBook, output };
};