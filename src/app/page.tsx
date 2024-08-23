"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type HuffmanNode = {
  char: number;
  freq: number;
  left: HuffmanNode | null;
  right: HuffmanNode | null;
}

export default function Component() {
  const [input, setInput] = useState<string>('a70b1\n00111100\n01111110\n11011011\n11111111\n11011011\n01100110\n00111100')
  const [output, setOutput] = useState<string>('')
  const [mode, setMode] = useState<'compress' | 'decompress'>('compress')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const buildHuffmanTree = (data: Uint8Array): HuffmanNode => {
    const freqMap = new Map<number, number>()
    for (const byte of data) {
      freqMap.set(byte, (freqMap.get(byte) || 0) + 1)
    }

    const pq = Array.from(freqMap.entries()).map(([char, freq]) => ({ char, freq, left: null, right: null } as HuffmanNode))
    pq.sort((a, b) => a.freq - b.freq)

    while (pq.length > 1) {
      const left = pq.shift()!
      const right = pq.shift()!
      const parent: HuffmanNode = {
        char: -1,
        freq: left.freq + right.freq,
        left,
        right
      }
      pq.push(parent)
      pq.sort((a, b) => a.freq - b.freq)
    }

    return pq[0]
  }

  const buildHuffmanCodes = (root: HuffmanNode): Map<number, number[]> => {
    const codes = new Map<number, number[]>()
    const dfs = (node: HuffmanNode | null, code: number[] = []) => {
      if (!node) return
      if (node.char !== -1) {
        codes.set(node.char, code)
        return
      }
      dfs(node.left, [...code, 0])
      dfs(node.right, [...code, 1])
    }
    dfs(root)
    return codes
  }

  const compressHuffman = (data: Uint8Array): Uint8Array => {
    const tree = buildHuffmanTree(data)
    const codes = buildHuffmanCodes(tree)
    
    const compressedBits: number[] = []
    
    // Serialize the tree
    const serializeTree = (node: HuffmanNode | null) => {
      if (!node) {
        compressedBits.push(0)
        return
      }
      compressedBits.push(1)
      if (node.char !== -1) {
        const charBits = node.char.toString(2).padStart(8, '0').split('').map(Number)
        compressedBits.push(...charBits)
      } else {
        serializeTree(node.left)
        serializeTree(node.right)
      }
    }
    
    serializeTree(tree)
    
    // Add separator
    compressedBits.push(...Array(8).fill(0))
    
    // Compress data
    for (const byte of data) {
      compressedBits.push(...codes.get(byte)!)
    }
    
    // Convert bits to bytes
    const compressedBytes = new Uint8Array(Math.ceil(compressedBits.length / 8))
    for (let i = 0; i < compressedBits.length; i++) {
      if (compressedBits[i]) {
        compressedBytes[Math.floor(i / 8)] |= 1 << (7 - (i % 8))
      }
    }
    
    return compressedBytes
  }

  const decompressHuffman = (compressedData: Uint8Array): Uint8Array => {
    let bitIndex = 0
    
    const readBit = (): number => {
      const bit = (compressedData[Math.floor(bitIndex / 8)] & (1 << (7 - (bitIndex % 8)))) !== 0 ? 1 : 0
      bitIndex++
      return bit
    }
    
    const readByte = (): number => {
      let byte = 0
      for (let i = 0; i < 8; i++) {
        byte = (byte << 1) | readBit()
      }
      return byte
    }
    
    // Deserialize the tree
    const deserializeTree = (): HuffmanNode | null => {
      if (readBit() === 0) return null
      const node: HuffmanNode = { char: -1, freq: 0, left: null, right: null }
      if (readBit() === 1) {
        node.char = readByte()
      } else {
        node.left = deserializeTree()
        node.right = deserializeTree()
      }
      return node
    }
    
    const root = deserializeTree()
    
    // Read separator
    for (let i = 0; i < 8; i++) readBit()
    
    // Decompress data
    const decompressed: number[] = []
    let node = root
    while (bitIndex < compressedData.length * 8) {
      if (!node) break
      if (node.char !== -1) {
        decompressed.push(node.char)
        node = root
      } else {
        node = readBit() === 0 ? node.left : node.right
      }
    }
    
    return new Uint8Array(decompressed)
  }

  const handleProcess = () => {
    if (mode === 'compress') {
      const inputData = new TextEncoder().encode(input)
      const compressed = compressHuffman(inputData)
      setOutput(Array.from(compressed).map(b => b.toString(16).padStart(2, '0')).join(''))
    } else {
      const inputData = new Uint8Array(input.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
      const decompressed = decompressHuffman(inputData)
      setOutput(new TextDecoder().decode(decompressed))
    }
  }

  const drawMatrix = (matrix: string) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rows = matrix.split('\n')
    const cellSize = 20
    const fontSize = 12
    const maxWidth = Math.max(...rows.map(row => row.length)) * cellSize
    canvas.width = maxWidth
    canvas.height = rows.length * cellSize

    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    rows.forEach((row, y) => {
      if (/^[01]+$/.test(row)) {
        [...row].forEach((cell, x) => {
          if (cell === '1') {
            ctx.fillStyle = 'black'
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
          }
        })
      } else {
        ctx.fillStyle = 'black'
        ctx.font = `${fontSize}px Arial`
        ctx.fillText(row, 0, (y + 1) * cellSize - (cellSize - fontSize) / 2)
      }
    })
  }

  useEffect(() => {
    drawMatrix(mode === 'compress' ? input : output)
  }, [input, output, mode])

  return (
    <div className="flex flex-col space-y-4 p-4">
      <Tabs value={mode} onValueChange={(value) => setMode(value as 'compress' | 'decompress')}>
        <TabsList>
          <TabsTrigger value="compress">Comprimir</TabsTrigger>
          <TabsTrigger value="decompress">Descomprimir</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>{mode === 'compress' ? 'Matriz Original' : 'Datos Comprimidos (Hex)'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'compress' ? "Ingrese la matriz aquí" : "Ingrese los datos comprimidos en hexadecimal"}
            rows={10}
          />
          <Button onClick={handleProcess} className="mt-2">{mode === 'compress' ? 'Comprimir' : 'Descomprimir'}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{mode === 'compress' ? 'Datos Comprimidos (Hex)' : 'Matriz Descomprimida'}</CardTitle>
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
    </div>
  )
}

