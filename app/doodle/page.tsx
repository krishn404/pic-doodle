'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import {  Undo, Redo, Download, Upload, Square, Circle, Minus, Plus } from 'lucide-react'
import { HexColorPicker } from 'react-colorful'

const brushStyles = [
  { icon: Minus, name: 'Line' },
  { icon: Square, name: 'Square' },
  { icon: Circle, name: 'Circle' },
]

export default function DoodlePage() {
  const [image, setImage] = useState<string | null>(null)
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(5)
  const [brushStyle, setBrushStyle] = useState('Line')
  const [isErasing, setIsErasing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [history, setHistory] = useState<ImageData[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
      }
    }
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.beginPath()
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
        setIsDrawing(true)
        saveState()
      }
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.lineWidth = brushSize
        ctx.strokeStyle = isErasing ? '#FFFFFF' : color
        
        switch (brushStyle) {
          case 'Line':
            ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
            ctx.stroke()
            break
          case 'Square':
            ctx.fillStyle = isErasing ? '#FFFFFF' : color
            ctx.fillRect(e.nativeEvent.offsetX - brushSize / 2, e.nativeEvent.offsetY - brushSize / 2, brushSize, brushSize)
            break
          case 'Circle':
            ctx.fillStyle = isErasing ? '#FFFFFF' : color
            ctx.beginPath()
            ctx.arc(e.nativeEvent.offsetX, e.nativeEvent.offsetY, brushSize / 2, 0, Math.PI * 2)
            ctx.fill()
            break
        }
      }
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const saveState = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        setHistory([...history.slice(0, historyIndex + 1), imageData])
        setHistoryIndex(historyIndex + 1)
      }
    }
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.putImageData(history[historyIndex - 1], 0, 0)
        }
      }
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.putImageData(history[historyIndex + 1], 0, 0)
        }
      }
    }
  }

  const exportImage = (format: 'jpg' | 'png') => {
    const canvas = canvasRef.current
    if (canvas) {
      const dataUrl = canvas.toDataURL(`image/${format}`)
      const link = document.createElement('a')
      link.download = `doodle.${format}`
      link.href = dataUrl
      link.click()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 to-gray-700">
      <h1 className="handwriting text-4xl font-bold mb-6 text-white">Image Doodle</h1>
      <div className="bg-white bg-opacity-40 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6 w-full max-w-4xl">
        <Tabs 
          defaultValue="draw" 
          className="mb-6"
          onValueChange={(value) => setIsErasing(value === 'erase')}
        >
          <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-900 rounded-full">
            <TabsTrigger 
              value="draw" 
              className="rounded-full data-[state=active]:bg-gray-900 data-[state=active]:text-white transition-all"
            >
              Draw
            </TabsTrigger>
            <TabsTrigger 
              value="erase" 
              className="rounded-full data-[state=active]:bg-gray-900 data-[state=active]:text-white transition-all"
            >
              Erase
            </TabsTrigger>
          </TabsList>
          <TabsContent value="draw">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-10 h-10 p-0 rounded-full">
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: color }} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <HexColorPicker color={color} onChange={setColor} />
                </PopoverContent>
              </Popover>
              <div className="flex items-center space-x-2 flex-1">
                <Minus className="w-4 h-4" />
                <Slider
                  min={1}
                  max={50}
                  step={1}
                  value={[brushSize]}
                  onValueChange={(value) => setBrushSize(value[0])}
                  className="flex-1"
                />
                <Plus className="w-4 h-4" />
              </div>
            </div>
            <ToggleGroup type="single" value={brushStyle} onValueChange={(value) => value && setBrushStyle(value)} className="bg-gray-900 p-1 rounded-lg">
              {brushStyles.map((style) => (
                <ToggleGroupItem 
                  key={style.name} 
                  value={style.name} 
                  aria-label={style.name}
                  className="data-[state=on]:bg-white data-[state=on]:text-gray-900 data-[state=on]:shadow-sm rounded-md transition-all"
                >
                  <style.icon className="w-4 h-4" />
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </TabsContent>
          <TabsContent value="erase">
            <div className="flex items-center space-x-2">
              <Minus className="w-4 h-4" />
              <Slider
                min={1}
                max={50}
                step={1}
                value={[brushSize]}
                onValueChange={(value) => setBrushSize(value[0])}
                className="flex-1"
              />
              <Plus className="w-4 h-4" />
            </div>
          </TabsContent>
        </Tabs>
        <div className="relative mb-6">
          {!image && (
            <div className="absolute inset-0 flex items-center justify-center">
              <label htmlFor="imageUpload" className="cursor-pointer bg-gray-500 text-white py-2 px-4 rounded-full flex items-center transition-colors hover:bg-gray-600">
                <Upload className="mr-2 h-4 w-4" /> Upload Image
              </label>
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          )}
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border border-gray-200 rounded-lg w-full h-auto bg-white shadow-inner"
            style={{ backgroundImage: `url(${image})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
          />
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            onClick={undo} 
            variant="outline" 
            className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-200">
            <Undo className="mr-2 h-4 w-4" /> Undo
          </Button>
          <Button 
            onClick={redo} 
            variant="outline" 
            className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-200">
            <Redo className="mr-2 h-4 w-4" /> Redo
          </Button>
          <Button 
            onClick={() => exportImage('jpg')} 
            variant="outline" 
            className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-200">
            <Download className="mr-2 h-4 w-4" /> Export JPG
          </Button>
          <Button 
            onClick={() => exportImage('png')} 
            variant="outline" 
            className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-200">
            <Download className="mr-2 h-4 w-4" /> Export PNG
          </Button>
        </div>
      </div>
    </div>
  )
}

