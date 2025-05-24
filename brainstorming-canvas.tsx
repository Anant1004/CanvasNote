"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, X, Edit2, Check, ExternalLink } from "lucide-react"

interface Note {
  id: string
  content: string
  isEditing?: boolean
}

interface TodoItem {
  id: string
  content: string
  completed: boolean
  isEditing?: boolean
}

interface Link {
  id: string
  title: string
  url: string
  isEditing?: boolean
}

export default function Component() {
  const [quickNotes, setQuickNotes] = useState<Note[]>([])
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [ideas, setIdeas] = useState<Note[]>([])
  const [links, setLinks] = useState<Link[]>([])

  const [newNote, setNewNote] = useState("")
  const [newTodo, setNewTodo] = useState("")
  const [newIdea, setNewIdea] = useState("")
  const [newLinkTitle, setNewLinkTitle] = useState("")
  const [newLinkUrl, setNewLinkUrl] = useState("")

  // Quick Notes functions
  const addQuickNote = () => {
    if (newNote.trim()) {
      setQuickNotes([...quickNotes, { id: Date.now().toString(), content: newNote }])
      setNewNote("")
    }
  }

  const deleteQuickNote = (id: string) => {
    setQuickNotes(quickNotes.filter((note) => note.id !== id))
  }

  const editQuickNote = (id: string, newContent: string) => {
    setQuickNotes(
      quickNotes.map((note) => (note.id === id ? { ...note, content: newContent, isEditing: false } : note)),
    )
  }

  const toggleEditQuickNote = (id: string) => {
    setQuickNotes(quickNotes.map((note) => (note.id === id ? { ...note, isEditing: !note.isEditing } : note)))
  }

  // Todo functions
  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { id: Date.now().toString(), content: newTodo, completed: false }])
      setNewTodo("")
    }
  }

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  const toggleTodo = (id: string) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
  }

  const editTodo = (id: string, newContent: string) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, content: newContent, isEditing: false } : todo)))
  }

  const toggleEditTodo = (id: string) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, isEditing: !todo.isEditing } : todo)))
  }

  // Ideas functions
  const addIdea = () => {
    if (newIdea.trim()) {
      setIdeas([...ideas, { id: Date.now().toString(), content: newIdea }])
      setNewIdea("")
    }
  }

  const deleteIdea = (id: string) => {
    setIdeas(ideas.filter((idea) => idea.id !== id))
  }

  const editIdea = (id: string, newContent: string) => {
    setIdeas(ideas.map((idea) => (idea.id === id ? { ...idea, content: newContent, isEditing: false } : idea)))
  }

  const toggleEditIdea = (id: string) => {
    setIdeas(ideas.map((idea) => (idea.id === id ? { ...idea, isEditing: !idea.isEditing } : idea)))
  }

  // Links functions
  const addLink = () => {
    if (newLinkTitle.trim() && newLinkUrl.trim()) {
      setLinks([
        ...links,
        {
          id: Date.now().toString(),
          title: newLinkTitle,
          url: newLinkUrl.startsWith("http") ? newLinkUrl : `https://${newLinkUrl}`,
        },
      ])
      setNewLinkTitle("")
      setNewLinkUrl("")
    }
  }

  const deleteLink = (id: string) => {
    setLinks(links.filter((link) => link.id !== id))
  }

  const editLink = (id: string, newTitle: string, newUrl: string) => {
    setLinks(
      links.map((link) =>
        link.id === id
          ? {
              ...link,
              title: newTitle,
              url: newUrl.startsWith("http") ? newUrl : `https://${newUrl}`,
              isEditing: false,
            }
          : link,
      ),
    )
  }

  const toggleEditLink = (id: string) => {
    setLinks(links.map((link) => (link.id === id ? { ...link, isEditing: !link.isEditing } : link)))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Brainstorming Canvas</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Notes Section */}
          <Card className="bg-yellow-100 border-yellow-300 shadow-lg">
            <CardHeader className="bg-yellow-200 border-b border-yellow-300">
              <CardTitle className="text-yellow-800 flex items-center gap-2">📝 Quick Notes</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex gap-2 mb-4">
                <Textarea
                  placeholder="Jot down a quick note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="bg-white border-yellow-300"
                  rows={2}
                />
                <Button onClick={addQuickNote} size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {quickNotes.map((note) => (
                  <div key={note.id} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 shadow-sm">
                    {note.isEditing ? (
                      <div className="flex gap-2">
                        <Textarea
                          defaultValue={note.content}
                          className="flex-1 bg-white"
                          rows={2}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.ctrlKey) {
                              editQuickNote(note.id, e.currentTarget.value)
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={(e) => {
                            const textarea = e.currentTarget.parentElement?.querySelector("textarea")
                            if (textarea) editQuickNote(note.id, textarea.value)
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-sm text-gray-700 flex-1">{note.content}</p>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleEditQuickNote(note.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteQuickNote(note.id)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* To-Do List Section */}
          <Card className="bg-green-100 border-green-300 shadow-lg">
            <CardHeader className="bg-green-200 border-b border-green-300">
              <CardTitle className="text-green-800 flex items-center gap-2">✅ To-Do List</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Add a new task..."
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTodo()}
                  className="bg-white border-green-300"
                />
                <Button onClick={addTodo} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {todos.map((todo) => (
                  <div key={todo.id} className="bg-green-50 p-3 rounded-lg border border-green-200 shadow-sm">
                    {todo.isEditing ? (
                      <div className="flex gap-2">
                        <Input
                          defaultValue={todo.content}
                          className="flex-1 bg-white"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              editTodo(todo.id, e.currentTarget.value)
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={(e) => {
                            const input = e.currentTarget.parentElement?.querySelector("input")
                            if (input) editTodo(todo.id, input.value)
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => toggleTodo(todo.id)}
                          className="rounded border-green-300"
                        />
                        <span
                          className={`flex-1 text-sm ${todo.completed ? "line-through text-gray-500" : "text-gray-700"}`}
                        >
                          {todo.content}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleEditTodo(todo.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTodo(todo.id)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ideas / Brainstorm Section */}
          <Card className="bg-purple-100 border-purple-300 shadow-lg">
            <CardHeader className="bg-purple-200 border-b border-purple-300">
              <CardTitle className="text-purple-800 flex items-center gap-2">💡 Ideas / Brainstorm</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex gap-2 mb-4">
                <Textarea
                  placeholder="Capture your brilliant ideas..."
                  value={newIdea}
                  onChange={(e) => setNewIdea(e.target.value)}
                  className="bg-white border-purple-300"
                  rows={2}
                />
                <Button onClick={addIdea} size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {ideas.map((idea) => (
                  <div key={idea.id} className="bg-purple-50 p-3 rounded-lg border border-purple-200 shadow-sm">
                    {idea.isEditing ? (
                      <div className="flex gap-2">
                        <Textarea
                          defaultValue={idea.content}
                          className="flex-1 bg-white"
                          rows={2}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.ctrlKey) {
                              editIdea(idea.id, e.currentTarget.value)
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={(e) => {
                            const textarea = e.currentTarget.parentElement?.querySelector("textarea")
                            if (textarea) editIdea(idea.id, textarea.value)
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-sm text-gray-700 flex-1">{idea.content}</p>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleEditIdea(idea.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteIdea(idea.id)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Links / References Section */}
          <Card className="bg-blue-100 border-blue-300 shadow-lg">
            <CardHeader className="bg-blue-200 border-b border-blue-300">
              <CardTitle className="text-blue-800 flex items-center gap-2">🔗 Links / References</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2 mb-4">
                <Input
                  placeholder="Link title..."
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  className="bg-white border-blue-300"
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="URL..."
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addLink()}
                    className="bg-white border-blue-300"
                  />
                  <Button onClick={addLink} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {links.map((link) => (
                  <div key={link.id} className="bg-blue-50 p-3 rounded-lg border border-blue-200 shadow-sm">
                    {link.isEditing ? (
                      <div className="space-y-2">
                        <Input defaultValue={link.title} className="bg-white" placeholder="Link title" />
                        <div className="flex gap-2">
                          <Input defaultValue={link.url} className="flex-1 bg-white" placeholder="URL" />
                          <Button
                            size="sm"
                            onClick={(e) => {
                              const inputs = e.currentTarget.parentElement?.parentElement?.querySelectorAll("input")
                              if (inputs && inputs.length >= 2) {
                                editLink(link.id, inputs[0].value, inputs[1].value)
                              }
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">{link.title}</p>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
                          >
                            {link.url}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleEditLink(link.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteLink(link.id)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
