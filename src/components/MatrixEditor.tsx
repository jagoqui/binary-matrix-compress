import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MatrixEditorProps {
  input: string;
  setInput: (value: string) => void;
  mode: "compress" | "decompress";
  onButtonClick: () => void;
}

const MatrixEditor: React.FC<MatrixEditorProps> = ({ input, setInput, mode, onButtonClick }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "compress" ? "Matriz Original" : "Datos Comprimidos"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "compress" ? "Ingrese la matriz aquí" : "Ingrese los datos comprimidos"}
          rows={10}
        />
        <Button onClick={onButtonClick} className="mt-2">
          {mode === "compress" ? "Comprimir" : "Descomprimir"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MatrixEditor;
