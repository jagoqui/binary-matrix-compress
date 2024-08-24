import { useEffect, useState } from "react";

// Definición del codeBook fijo
const codeBook: { [key: string]: string } = {
  "0": "B",
  "1": "A",
  "2": "AB",
  "3": "V",
  "4": "VB",
  "5": "VA",
  "6": "VAB",
  "7": "R",
  "8": "RB",
  "9": "RA",
  "A": "RAB",
  "B": "RV",
  "C": "RVB",
  "D": "RVA",
  "E": "RVAB",
  "F": "X",
  "\n": "Z"
};

interface CodeMap {
  [character: string]: string;
}

export const useOptimizeRGBHuffmanCompression = (input: string, mode: "compress" | "decompress") => {
  const [output, setOutput] = useState<string>("");

  useEffect(() => {
    // Invertir el mapa para facilitar la decodificación
    const invertCodeMap = (codeMap: CodeMap): CodeMap => {
      return Object.fromEntries(Object.entries(codeMap).map(([k, v]) => [v, k]));
    };

    const compressUsingFixedCodeBook = (input: string): string => {
      let encodedOutput = "";
      for (const char of input) {
        if (codeBook[char] !== undefined) {
          encodedOutput += codeBook[char];
        } else {
          console.warn(`Carácter no encontrado en el codeBook: ${char}`);
        }
      }
      return encodedOutput;
    };

    const decompressUsingFixedCodeBook = (encoded: string): string => {
      const reversedCodeMap = invertCodeMap(codeBook);
      let currentCode = "";
      let decodedOutput = "";

      for (const char of encoded) {
        currentCode += char;
        if (reversedCodeMap[currentCode] !== undefined) {
          decodedOutput += reversedCodeMap[currentCode];
          currentCode = "";
        }
      }

      // Verificar si queda algún código que no se ha decodificado
      if (currentCode.length > 0) {
        console.warn(`Cadena incompleta o error de codificación: ${currentCode}`);
      }

      return decodedOutput;
    };

    if (mode === "compress") {
      const encodedData = compressUsingFixedCodeBook(input);
      setOutput(encodedData);
    } else {
      const decodedData = decompressUsingFixedCodeBook(input);
      setOutput(decodedData);
    }
  }, [input, mode]);

  return { codeBook, output };
};
