import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, email } = body;

    // Validate input
    if (!title || !email) {
      return NextResponse.json(
        { error: 'Title and email are required' },
        { status: 400 }
      );
    }

    // Insert task into Supabase
    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          user_email: email,
          title: title.trim(),
          description: description?.trim() || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return NextResponse.json(
        { error: 'Failed to create task' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, task: data }, { status: 201 });
  } catch (error) {
    console.error('Error in create-task API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

