import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MatrixEditorProps {
  input: string;
  setInput: (value: string) => void;
  mode: "compress" | "decompress";
}

const MatrixEditor: React.FC<MatrixEditorProps> = ({ input, setInput, mode }) => {
  const [localInput, setLocalInput] = useState<string>(input);

  // Function to filter out invalid characters
  const validateInput = (input: string): string => {
    const validChars = /^[0-9A-F\n]+$/i;
    return input.split("").filter(char => validChars.test(char)).join("");
  };

  // Function to handle input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = event.target;
    const newValue = textarea.value.toUpperCase();

    // Filter the input
    const filteredValue = mode === 'compress' ? validateInput(newValue) : newValue;

    // Update the local state and input
    setLocalInput(filteredValue);
    setInput(filteredValue);
    localStorage.setItem(`matrixInput_${mode}`, newValue);
  };

  // Function to handle input reset
  const handleReset = () => {
    // Confirm reset action
    if (window.confirm("¿Estás seguro de que deseas resetear el input?")) {
      setLocalInput("");
      setInput("");
      localStorage.removeItem(`matrixInput_${mode}`); // Clear input from local storage
    }
  };

  // Sync localInput with input prop
  useEffect(() => {
    setLocalInput(input);
  }, [input]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "compress" ? "Matriz Original" : "Datos Comprimidos"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={localInput}
          onChange={handleInputChange}
          placeholder={mode === "compress" ? "Ingrese la matriz aquí" : "Ingrese los datos comprimidos"}
          rows={10}
        />
        <Button onClick={handleReset} className="mt-4">
          Resetear
        </Button>
      </CardContent>
    </Card>
  );
};

export default MatrixEditor;
