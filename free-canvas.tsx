"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { StickyNote, CheckSquare, Moon, Sun, Palette, X } from "lucide-react"
import { useNotes } from "@/hooks/useNotes"
import { CanvasItem, TodoItem } from "@/types/canvas"

const lightThemeColors = [
  "bg-yellow-300",
  "bg-pink-300",
  "bg-blue-300",
  "bg-green-300",
  "bg-purple-300",
  "bg-orange-300",
  "bg-red-300",
  "bg-indigo-300",
]

const darkThemeColors = [
  "bg-yellow-600",
  "bg-pink-600",
  "bg-blue-600",
  "bg-green-600",
  "bg-purple-600",
  "bg-orange-600",
  "bg-red-600",
  "bg-indigo-600",
]

export default function Component() {
  const { notes, loading, error, createNote, updateNote, deleteNote, setNotes } = useNotes();
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [selectedTool, setSelectedTool] = useState<"note" | "todo" | null>(null)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [resizingItem, setResizingItem] = useState<string | null>(null)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [isClient, setIsClient] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Get current color palette based on theme
  const getCurrentColors = () => (isDarkMode ? darkThemeColors : lightThemeColors)

  // Auto-resize textarea function
  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto"
    textarea.style.height = textarea.scrollHeight + "px"
  }

  // Set client-side flag
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load theme from localStorage on mount
  useEffect(() => {
    if (!isClient) return

    try {
      const savedTheme = localStorage.getItem("brainstorming-canvas-theme")
      if (savedTheme) {
        setIsDarkMode(JSON.parse(savedTheme))
      }
    } catch (error) {
      console.error("Error loading theme from localStorage:", error)
    }
  }, [isClient])

  // Save theme to localStorage
  useEffect(() => {
    if (!isClient) return

    try {
      localStorage.setItem("brainstorming-canvas-theme", JSON.stringify(isDarkMode))
    } catch (error) {
      console.error("Error saving theme to localStorage:", error)
    }
  }, [isDarkMode, isClient])

  // Update time every second
  useEffect(() => {
    if (!isClient) return

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [isClient])

  // Handle keyboard events
  useEffect(() => {
    if (!isClient) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selectedItem) {
        deleteItem(selectedItem)
        setSelectedItem(null)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [selectedItem, isClient])

  // Handle paste events for images
  useEffect(() => {
    if (!isClient) return

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile()
          if (blob) {
            const imageUrl = URL.createObjectURL(blob)
            const newItem: CanvasItem = {
              id: Date.now().toString(),
              type: "image",
              x: Math.random() * 300 + 100,
              y: Math.random() * 300 + 100,
              content: "Pasted Image",
              imageUrl,
              imageWidth: 200,
              imageHeight: 150,
            }
            await createNote(newItem)
          }
        }
      }
    }

    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [isClient])

  // Handle global mouse events for resizing
  useEffect(() => {
    if (!isClient || !resizingItem) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const item = notes.find((i) => i.id === resizingItem);
      if (!item) return;

      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const newWidth = Math.max(150, resizeStart.width + deltaX);
      const newHeight = Math.max(100, resizeStart.height + deltaY);

      // Update the note's dimensions directly in the state
      const updatedNotes = notes.map(note => {
        if (note.id === resizingItem) {
          if (note.type === "image") {
            return {
              ...note,
              imageWidth: newWidth,
              imageHeight: newHeight
            };
          } else {
            return {
              ...note,
              noteWidth: newWidth,
              noteHeight: newHeight
            };
          }
        }
        return note;
      });

      // Update the state immediately for smooth resizing
      setNotes(updatedNotes);
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Save the final dimensions to the database
      const item = notes.find((i) => i.id === resizingItem);
      if (item) {
        if (item.type === "image") {
          updateNote(resizingItem, {
            imageWidth: item.imageWidth,
            imageHeight: item.imageHeight
          });
        } else {
          updateNote(resizingItem, {
            noteWidth: item.noteWidth,
            noteHeight: item.noteHeight
          });
        }
      }

      setResizingItem(null);
    };

    window.addEventListener("mousemove", handleGlobalMouseMove, { passive: false });
    window.addEventListener("mouseup", handleGlobalMouseUp, { passive: false });

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [resizingItem, resizeStart, notes, updateNote, isClient, setNotes]);

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    e.preventDefault();

    const item = notes.find((i) => i.id === itemId);
    if (!item) return;

    setSelectedItem(itemId);
    setResizingItem(itemId);

    const initialWidth = item.type === "image" 
      ? (item.imageWidth || 200)
      : (item.noteWidth || 200);
    
    const initialHeight = item.type === "image"
      ? (item.imageHeight || 150)
      : (item.noteHeight || 120);

    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: initialWidth,
      height: initialHeight
    });
  };

  // Handle canvas click to add new item
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!selectedTool || e.target !== canvasRef.current) return

    const rect = canvasRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const currentColors = getCurrentColors()
    const newItem: CanvasItem = {
      id: Date.now().toString(),
      type: selectedTool,
      x: x - 100,
      y: y - 50,
      content: selectedTool === "note" ? "New note" : "",
      todos:
        selectedTool === "todo"
          ? [{ id: Date.now().toString(), content: "New task", completed: false, isEditing: true }]
          : undefined,
      isEditing: selectedTool === "note",
      noteWidth: 200,
      noteHeight: 120,
      color: currentColors[Math.floor(Math.random() * currentColors.length)],
      rotation: Math.random() * 6 - 3,
      createdAt: new Date(),
    }

    createNote(newItem)
    setSelectedTool(null)
    setSelectedItem(newItem.id)
  }

  // Handle canvas double-click to add new note
  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    if (e.target !== canvasRef.current) return

    const rect = canvasRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const currentColors = getCurrentColors()
    const newItem: CanvasItem = {
      id: Date.now().toString(),
      type: "note",
      x: x - 100,
      y: y - 50,
      content: "",
      isEditing: true,
      noteWidth: 200,
      noteHeight: 120,
      color: currentColors[Math.floor(Math.random() * currentColors.length)],
      rotation: Math.random() * 6 - 3,
      createdAt: new Date(),
    }

    createNote(newItem)
    setSelectedItem(newItem.id)
  }

  // Handle item click to select and edit
  const handleItemClick = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation()
    setSelectedItem(itemId)
    const item = notes.find((i) => i.id === itemId)
    if (item && item.type === "note") {
      updateNote(itemId, { isEditing: true })
    }
  }

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent, itemId: string) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

    const item = notes.find((i) => i.id === itemId)
    if (!item) return

    setDraggedItem(itemId)
    setSelectedItem(itemId)
    setDragOffset({
      x: e.clientX - item.x,
      y: e.clientY - item.y,
    })
  }

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedItem && !resizingItem) {
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y
      updateNote(draggedItem, { x: newX, y: newY })
    }
  }

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setDraggedItem(null)
  }

  // Delete item
  const deleteItem = async (id: string) => {
    try {
      await deleteNote(id)
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  // Edit note content
  const editItem = async (id: string, newContent: string) => {
    try {
      await updateNote(id, { content: newContent })
    } catch (error) {
      console.error("Error updating item:", error)
    }
  }

  // Auto-resize note based on content
  const autoResizeNote = (itemId: string) => {
    // Remove automatic resizing - only manual resizing allowed
    return
  }

  // Add new todo to a todo note
  const addTodoToNote = async (noteId: string) => {
    const note = notes.find(item => item.id === noteId)
    if (!note) return

    const newTodo: TodoItem = {
      id: Date.now().toString(),
      content: "New Todo",
      completed: false,
      isEditing: true,
    }

    try {
      await updateNote(noteId, {
        todos: [...(note.todos || []), newTodo]
      })
    } catch (error) {
      console.error("Error adding todo:", error)
    }
  }

  // Update todo item
  const updateTodoItem = async (noteId: string, todoId: string, updates: Partial<TodoItem>) => {
    const note = notes.find(item => item.id === noteId)
    if (!note || !note.todos) return

    const updatedTodos = note.todos.map(todo =>
      todo.id === todoId ? { ...todo, ...updates } : todo
    )

    try {
      await updateNote(noteId, { todos: updatedTodos })
    } catch (error) {
      console.error("Error updating todo:", error)
    }
  }

  // Delete todo item
  const deleteTodoItem = async (noteId: string, todoId: string) => {
    const note = notes.find(item => item.id === noteId)
    if (!note || !note.todos) return

    const updatedTodos = note.todos.filter(todo => todo.id !== todoId)

    try {
      await updateNote(noteId, { todos: updatedTodos })
    } catch (error) {
      console.error("Error deleting todo:", error)
    }
  }

  // Change item color
  const changeColor = async (id: string) => {
    const note = notes.find(item => item.id === id)
    if (!note) return

    const colors = getCurrentColors()
    const currentIndex = colors.indexOf(note.color || colors[0])
    const nextColor = colors[(currentIndex + 1) % colors.length]

    try {
      await updateNote(id, { color: nextColor })
    } catch (error) {
      console.error("Error changing color:", error)
    }
  }

  // Handle file drop for images
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(files[0])

      // Drop on canvas
      const rect = canvasRef.current!.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const newItem: CanvasItem = {
        id: Date.now().toString(),
        type: "image",
        x: x - 100,
        y: y - 75,
        content: files[0].name,
        imageUrl,
        imageWidth: 200,
        imageHeight: 150,
      }
      createNote(newItem)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const formatCreationTime = (date: Date | undefined) => {
    if (!date) return ""
    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Don't render until client-side
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
      onClick={() => setSelectedItem(null)}
    >
      {/* Global CSS to hide all scrollbars */}
      <style jsx global>{`
        /* Hide scrollbars for webkit browsers */
        textarea::-webkit-scrollbar,
        div::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbars for Firefox */
        textarea,
        div {
          scrollbar-width: none;
        }
        
        /* Hide scrollbars for IE and Edge */
        textarea,
        div {
          -ms-overflow-style: none;
        }
      `}</style>

      {/* Theme Toggle */}
      <Button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`fixed top-4 right-4 z-50 rounded-full w-12 h-12 p-0 ${
          isDarkMode
            ? "bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            : "bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
        }`}
        variant="outline"
      >
        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </Button>

      {/* Floating Clock */}
      <Card
        className={`fixed top-4 left-4 z-50 p-4 ${
          isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="text-center">
          <div className={`text-2xl font-mono font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            {formatTime(currentTime)}
          </div>
          <div className={`text-sm opacity-70 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            {formatDate(currentTime)}
          </div>
        </div>
      </Card>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-screen relative overflow-hidden cursor-crosshair"
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {/* Canvas Items */}
        {notes.map((item) => {
          // Render images directly without sticky note wrapper
          if (item.type === "image") {
            return (
              <div
                key={item.id}
                className={`absolute cursor-move select-none transition-transform hover:scale-105 ${
                  draggedItem === item.id ? "z-50 scale-105" : selectedItem === item.id ? "z-40" : "z-10"
                } ${selectedItem === item.id ? "ring-2 ring-blue-400 ring-opacity-50 rounded" : ""}`}
                style={{
                  left: item.x,
                  top: item.y,
                  width: item.imageWidth || 200,
                  height: item.imageHeight || 150,
                }}
                onMouseDown={(e) => handleMouseDown(e, item.id)}
                onClick={(e) => handleItemClick(e, item.id)}
              >
                <div className="relative w-full h-full">
                  <img
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={item.content}
                    className="w-full h-full object-cover rounded shadow-lg"
                    draggable={false}
                  />
                  {/* Resize handle for images */}
                  {selectedItem === item.id && (
                    <div
                      className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-500 border-2 border-white cursor-se-resize opacity-90 hover:opacity-100 rounded-full flex items-center justify-center shadow-lg"
                      style={{ zIndex: 10000 }}
                      onMouseDown={(e) => handleResizeStart(e, item.id)}
                    >
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            )
          }

          // Render sticky notes for notes and todos
          return (
            <div
              key={item.id}
              className={`absolute cursor-move select-none transition-transform hover:scale-105 ${
                draggedItem === item.id ? "z-50 scale-105" : selectedItem === item.id ? "z-40" : "z-10"
              } ${selectedItem === item.id ? "ring-2 ring-blue-400 ring-opacity-50" : ""}`}
              style={{
                left: item.x,
                top: item.y,
                transform: `rotate(${item.rotation || 0}deg)`,
                width: item.noteWidth || 200,
                height: item.noteHeight || 120,
                minWidth: "150px",
                minHeight: "100px",
              }}
              onMouseDown={(e) => handleMouseDown(e, item.id)}
              onClick={(e) => handleItemClick(e, item.id)}
            >
              {/* Sticky Note */}
              <div
                className={`${item.color || getCurrentColors()[0]} p-4 shadow-lg relative w-full h-full`}
                style={{
                  clipPath: "polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 0 100%)",
                  overflow: "hidden",
                }}
              >
                {/* Corner fold effect */}
                <div
                  className="absolute top-0 right-0 w-4 h-4 bg-black bg-opacity-10"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 0 100%)",
                  }}
                />

                {/* Action buttons */}
                <div className="absolute top-1 right-5 flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      changeColor(item.id)
                    }}
                    className="h-5 w-5 p-0 hover:bg-black hover:bg-opacity-10"
                  >
                    <Palette className="w-3 h-3" />
                  </Button>
                </div>

                {/* Content */}
                <div
                  className="mt-2 pr-2"
                  style={{
                    overflow: "hidden",
                    height: "calc(100% - 50px)", // Reserve space for timestamp and padding
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {item.type === "note" ? (
                    // Regular note content
                    item.isEditing ? (
                      <textarea
                        defaultValue={item.content}
                        className={`w-full bg-transparent border-none outline-none p-0 text-sm font-handwriting resize-none flex-1 ${
                          isDarkMode ? "text-gray-900" : "text-gray-900"
                        }`}
                        style={{
                          overflow: "hidden",
                          scrollbarWidth: "none",
                          msOverflowStyle: "none",
                          minHeight: "40px",
                          maxHeight: "100%",
                        }}
                        autoFocus
                        onInput={(e) => {
                          // Update content in real-time
                          const newContent = e.currentTarget.value
                          updateNote(item.id, { content: newContent })

                          // Auto-resize textarea immediately
                          e.currentTarget.style.height = "auto"
                          const newHeight = Math.min(
                            e.currentTarget.scrollHeight,
                            e.currentTarget.parentElement?.clientHeight || 200,
                          )
                          e.currentTarget.style.height = newHeight + "px"
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.ctrlKey) {
                            editItem(item.id, e.currentTarget.value)
                          }
                        }}
                        onBlur={(e) => editItem(item.id, e.currentTarget.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="flex-1 overflow-hidden">
                        <p
                          className={`text-sm font-handwriting whitespace-pre-wrap break-words leading-relaxed ${
                            isDarkMode ? "text-gray-900" : "text-gray-900"
                          }`}
                        >
                          {item.content}
                        </p>
                      </div>
                    )
                  ) : (
                    // Todo list content
                    <div className="space-y-2 flex-1 overflow-hidden">
                      {item.todos?.map((todo, index) => (
                        <div key={todo.id} className="flex items-start gap-2 group">
                          <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => updateTodoItem(item.id, todo.id, { completed: !todo.completed })}
                            className="mt-1 rounded flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          />
                          {todo.isEditing ? (
                            <input
                              type="text"
                              defaultValue={todo.content}
                              className={`flex-1 bg-transparent border-none outline-none p-0 text-sm font-handwriting min-w-0 ${
                                isDarkMode ? "text-gray-900" : "text-gray-900"
                              }`}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault()
                                  const content = e.currentTarget.value.trim()
                                  if (content) {
                                    updateTodoItem(item.id, todo.id, {
                                      content: content,
                                      isEditing: false,
                                    })
                                    addTodoToNote(item.id)
                                  } else {
                                    // If content is empty, just stop editing without creating new todo
                                    updateTodoItem(item.id, todo.id, {
                                      content: todo.content,
                                      isEditing: false,
                                    })
                                  }
                                }
                              }}
                              onBlur={(e) => {
                                const content = e.currentTarget.value.trim()
                                if (content) {
                                  updateTodoItem(item.id, todo.id, {
                                    content: content,
                                    isEditing: false,
                                  })
                                } else {
                                  // If content is empty, either restore original content or delete if it was a new empty todo
                                  if (todo.content === "") {
                                    deleteTodoItem(item.id, todo.id)
                                  } else {
                                    updateTodoItem(item.id, todo.id, {
                                      content: todo.content,
                                      isEditing: false,
                                    })
                                  }
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span
                              className={`flex-1 text-sm font-handwriting cursor-text break-words min-w-0 ${
                                todo.completed ? "line-through opacity-60" : ""
                              } ${isDarkMode ? "text-gray-900" : "text-gray-900"}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                updateTodoItem(item.id, todo.id, { isEditing: true })
                              }}
                            >
                              {todo.content}
                            </span>
                          )}
                          <button
                            className="opacity-60 hover:opacity-100 text-red-600 hover:text-red-800 p-1 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteTodoItem(item.id, todo.id)
                            }}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Creation timestamp */}
                {item.createdAt && (
                  <div className="absolute bottom-1 left-2 text-xs opacity-50 font-mono">
                    {formatCreationTime(item.createdAt)}
                  </div>
                )}
              </div>

              {/* Resize handle for notes */}
              {selectedItem === item.id && (
                <div
                  className="absolute w-10 h-10 bg-blue-500 border-2 border-white cursor-se-resize opacity-90 hover:opacity-100 rounded-full flex items-center justify-center shadow-lg"
                  style={{
                    bottom: -20,
                    right: -20,
                    zIndex: 10000,
                    transform: `rotate(${-(item.rotation || 0)}deg)`,
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleResizeStart(e, item.id);
                  }}
                >
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Floating Bottom Toolbar */}
      <Card
        className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 ${
          isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2 p-3">
          <Button
            variant={selectedTool === "note" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTool(selectedTool === "note" ? null : "note")}
            className="flex items-center gap-2"
          >
            <StickyNote className="w-4 h-4" />
            Note
          </Button>

          <Button
            variant={selectedTool === "todo" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTool(selectedTool === "todo" ? null : "todo")}
            className="flex items-center gap-2"
          >
            <CheckSquare className="w-4 h-4" />
            Todo
          </Button>
        </div>
      </Card>
    </div>
  )
}
