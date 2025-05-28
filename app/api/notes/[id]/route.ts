import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';
import mongoose from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    await connectDB();
    const note = await Note.findOne({ id });
    
    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json(
      { error: 'Error fetching note' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    await connectDB();
    const body = await request.json();
    
    // Log the update data
    console.log('Updating note with data:', JSON.stringify(body, null, 2));
    
    // Force schema update by dropping the model if it exists
    if (mongoose.models.Note) {
      delete mongoose.models.Note;
    }
    
    const note = await Note.findOneAndUpdate(
      { id },
      { ...body, updatedAt: new Date() },
      { 
        new: true, 
        runValidators: true,
        strict: false // Allow fields not in schema
      }
    );
    
    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(note);
  } catch (error) {
    // Log the full error for debugging
    console.error('Error updating note:', error);
    
    return NextResponse.json(
      { 
        error: 'Error updating note',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    await connectDB();
    const note = await Note.findOneAndDelete({ id });
    
    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
} 