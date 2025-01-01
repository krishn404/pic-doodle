'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Undo, Redo, Download, Upload, PenLine, Paintbrush, SprayCanIcon as Spray, Eraser } from 'lucide-react'
import { HexColorPicker } from 'react-colorful'

const brushStyles = [
  { icon: PenLine, name: 'Pen' },
  { icon: Paintbrush, name: 'Brush' },
  { icon: Spray, name: 'Spray' },
  { icon: Eraser, name: 'Eraser' },
]

export default function DoodlePage() {
  const [image, setImage] = useState<string | null>(null)
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(5)
  const [brushStyle, setBrushStyle] = useState('Pen')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [history, setHistory] = useState<ImageData[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })

  useEffect(() => {
    const updateCanvasSize = () => {
      const container = document.getElementById('canvas-container')
      if (container) {
        const containerWidth = container.clientWidth
        const newHeight = containerWidth * (3/4)
        setCanvasSize({
          width: containerWidth,
          height: newHeight
        })
      }
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        saveState()
      }
    }
  }, [canvasSize])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          const canvas = canvasRef.current
          if (canvas) {
            const ctx = canvas.getContext('2d')
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height)
              const scale = Math.min(canvas.width / img.width, canvas.height / img.height)
              const x = (canvas.width - img.width * scale) / 2
              const y = (canvas.height - img.height * scale) / 2
              ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
              setImage(event.target?.result as string)
              saveState()
            }
          }
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const rect = canvas.getBoundingClientRect()
        const x = (e.clientX - rect.left) * (canvas.width / rect.width)
        const y = (e.clientY - rect.top) * (canvas.height / rect.height)
        ctx.beginPath()
        ctx.moveTo(x, y)
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
        const rect = canvas.getBoundingClientRect()
        const x = (e.clientX - rect.left) * (canvas.width / rect.width)
        const y = (e.clientY - rect.top) * (canvas.height / rect.height)
        
        ctx.lineWidth = brushSize
        
        if (brushStyle === 'Eraser') {
          ctx.globalCompositeOperation = 'destination-out'
        } else {
          ctx.globalCompositeOperation = 'source-over'
          ctx.strokeStyle = color
          ctx.fillStyle = color
        }
        
        switch (brushStyle) {
          case 'Pen':
            ctx.lineTo(x, y)
            ctx.stroke()
            break
          case 'Brush':
            ctx.lineTo(x, y)
            ctx.stroke()
            for (let i = 0; i < 3; i++) {
              ctx.beginPath()
              ctx.arc(x + Math.random() * brushSize - brushSize / 2, y + Math.random() * brushSize - brushSize / 2, brushSize / 4, 0, Math.PI * 2)
              ctx.fill()
            }
            break
          case 'Spray':
            for (let i = 0; i < brushSize * 5; i++) {
              const offsetX = (Math.random() - 0.5) * brushSize * 2
              const offsetY = (Math.random() - 0.5) * brushSize * 2
              const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY)
              if (distance <= brushSize) {
                ctx.fillRect(x + offsetX, y + offsetY, 1, 1)
              }
            }
            break
          case 'Eraser':
            ctx.beginPath()
            ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
            ctx.fill()
            break
        }
      }
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.globalCompositeOperation = 'source-over'
      }
    }
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

  const handleColorChange = (newColor: string) => {
    setColor(newColor)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white text-center mb-8">Image Doodle</h1>
        <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-6 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-10 h-10 p-0 rounded-full border-2"
                    style={{ backgroundColor: color }}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <HexColorPicker color={color} onChange={handleColorChange} />
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-2 w-48">
                <Slider
                  min={1}
                  max={50}
                  step={1}
                  value={[brushSize]}
                  onValueChange={(value) => setBrushSize(value[0])}
                  className="flex-1"
                />
              </div>
            </div>
            <ToggleGroup 
              type="single" 
              value={brushStyle} 
              onValueChange={(value) => value && setBrushStyle(value)}
              className="flex gap-2"
            >
              {brushStyles.map((style) => (
                <ToggleGroupItem 
                  key={style.name} 
                  value={style.name} 
                  aria-label={style.name}
                  className="w-10 h-10 p-2 data-[state=on]:bg-indigo-500 data-[state=on]:text-white rounded-lg transition-all text-gray-300"
                >
                  <style.icon className="w-full h-full" />
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div 
            id="canvas-container" 
            className="relative bg-white rounded-lg overflow-hidden mb-6"
            style={{ aspectRatio: '4/3' }}
          >
            {!image && (
              <div className="absolute inset-0 flex items-center justify-center">
                <label htmlFor="imageUpload" className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors">
                  <Upload className="w-12 h-12" />
                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              className="w-full h-full"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
            />
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={undo} variant="secondary" className="flex items-center">
              <Undo className="mr-2 h-4 w-4" /> Undo
            </Button>
            <Button onClick={redo} variant="secondary" className="flex items-center">
              <Redo className="mr-2 h-4 w-4" /> Redo
            </Button>
            <Button onClick={() => exportImage('jpg')} variant="secondary" className="flex items-center">
              <Download className="mr-2 h-4 w-4" /> Export JPG
            </Button>
            <Button onClick={() => exportImage('png')} variant="secondary" className="flex items-center">
              <Download className="mr-2 h-4 w-4" /> Export PNG
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

