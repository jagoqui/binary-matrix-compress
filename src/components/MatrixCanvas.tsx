import React, { useRef, useEffect } from "react";

interface MatrixCanvasProps {
  matrix: string;
}

const MatrixCanvas: React.FC<MatrixCanvasProps> = ({ matrix }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
    drawMatrix(matrix);
  }, [matrix]);

  const canvasStyle: React.CSSProperties = {
    width: '100%',        // Adjust as needed
    maxWidth: '300px',    // Set a max-width to control the maximum size
    height: 'auto',       // Adjust height automatically
    border: '1px solid gray'
  };

  return <canvas ref={canvasRef} style={canvasStyle} />;
};

export default MatrixCanvas;
