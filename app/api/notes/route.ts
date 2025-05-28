import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Log the incoming request body for debugging
    console.log('Creating note with data:', JSON.stringify(body, null, 2));
    
    // Force schema update by dropping the model if it exists
    if (mongoose.models.Note) {
      delete mongoose.models.Note;
    }
    
    const note = await Note.create(body);
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    // Log the full error for debugging
    console.error('Error creating note:', error);
    
    // Return a more detailed error message
    return NextResponse.json(
      { 
        error: 'Error creating note',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const notes = await Note.find({}).sort({ createdAt: -1 });
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { 
        error: 'Error fetching notes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 