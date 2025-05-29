"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  const { token } = useAuth();

  const fetchNotes = useCallback(async () => {
    try {
      const response = await fetch('/api/notes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }
      
      const data = await response.json();
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setNotes([]);
      setLoading(false);
      return;
    }
    fetchNotes();
  }, [token, fetchNotes]);

  const createNote = async (note: CanvasItem) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(note),
      });

      if (!response.ok) {
        throw new Error('Failed to create note');
      }

      const newNote = await response.json();
      setNotes(prev => [...prev, newNote]);
      return newNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const updateNote = useCallback((id: string, updates: Partial<CanvasItem>) => {
    // Optimistically update the UI
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, ...updates } : note
    ));

    // Check if this is a position update
    const isPositionUpdate = 'x' in updates || 'y' in updates;

    if (isPositionUpdate) {
      // For position updates, use a shorter debounce time (100ms)
      const debouncedUpdate = debounce(async () => {
        try {
          const response = await fetch(`/api/notes/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updates),
          });
          
          if (!response.ok) {
            throw new Error('Failed to update note');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          // Revert the optimistic update on error
          fetchNotes();
        }
      }, 100); // Shorter debounce time for position updates

      debouncedUpdate();
    } else {
      // For other updates, use longer debounce time (500ms)
      const debouncedUpdate = debounce(async () => {
        try {
          const response = await fetch(`/api/notes/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updates),
          });
          
          if (!response.ok) {
            throw new Error('Failed to update note');
          }
          
          const updatedNote = await response.json();
          setNotes(prev => prev.map(note => 
            note.id === id ? updatedNote : note
          ));
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          // Revert the optimistic update on error
          fetchNotes();
        }
      }, 500);

      debouncedUpdate();
    }
  }, [token, fetchNotes]);

  const deleteNote = async (id: string) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    setNotes
  };
} 