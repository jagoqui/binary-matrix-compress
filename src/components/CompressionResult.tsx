import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CompressionResultProps {
  codeBook: object;
  output: string;
}

const CompressionResult: React.FC<CompressionResultProps> = ({ codeBook, output }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Texto copiado al portapapeles!');
    }).catch((error) => {
      console.error('Error al copiar al portapapeles: ', error);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultado</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <strong>Codificación:</strong>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: '100%', overflowX: 'auto' }}>
            {output}
          </pre>
          <strong>Longitud: {output.length}</strong>
          <button 
            onClick={() => copyToClipboard(output)} 
            style={{
              display: 'block',
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Copiar al portapapeles
          </button>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <strong>CodeBook:</strong>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: '100%', overflowX: 'auto' }}>
            {JSON.stringify(codeBook, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompressionResult;
