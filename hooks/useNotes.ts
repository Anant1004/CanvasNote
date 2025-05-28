import { useState, useEffect, useCallback } from 'react';
import { CanvasItem } from '@/types/canvas';

// Debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function useNotes() {
  const [notes, setNotes] = useState<CanvasItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all notes
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notes');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to fetch notes');
      }
      const data = await response.json();
      setNotes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  // Create a new note
  const createNote = async (note: CanvasItem) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(note),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to create note');
      }
      
      const newNote = await response.json();
      setNotes(prev => [...prev, newNote]);
      return newNote;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create note';
      setError(errorMessage);
      throw err;
    }
  };

  // Update a note with optimistic updates
  const updateNote = useCallback((id: string, updates: Partial<CanvasItem>) => {
    // Optimistically update the UI
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, ...updates } : note
    ));

    // Debounced API call
    const debouncedUpdate = debounce(async () => {
      try {
        const response = await fetch(`/api/notes/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || 'Failed to update note');
        }
        
        const updatedNote = await response.json();
        setNotes(prev => prev.map(note => 
          note.id === id ? updatedNote : note
        ));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update note';
        setError(errorMessage);
        // Revert the optimistic update on error
        fetchNotes();
      }
    }, 100);

    debouncedUpdate();
  }, []);

  // Delete a note
  const deleteNote = async (id: string) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to delete note');
      }
      
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete note';
      setError(errorMessage);
      throw err;
    }
  };

  // Load notes on mount
  useEffect(() => {
    fetchNotes();
  }, []);

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    refreshNotes: fetchNotes,
    setNotes, // Expose setNotes for direct state updates
  };
} 