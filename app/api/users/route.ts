import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

type PostBody = {
  email?: string;
  name?: string;
  phone?: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PostBody;
    const email = body?.email?.trim();
    const name = body?.name?.trim();
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : body?.phone ?? null;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (findError) {
      console.error('Error finding user by email:', findError);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    if (existingUser) {
      // Update only the phone field if provided; otherwise keep current value
      if (typeof body.phone === 'undefined') {
        return NextResponse.json(
          {
            message: 'User exists; no phone provided, user unchanged',
            user: existingUser,
          },
          { status: 200 }
        );
      }

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ phone })
        .eq('email', email)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user phone:', updateError);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          message: 'User phone updated successfully',
          user: updatedUser,
        },
        { status: 200 }
      );
    }

    // Create new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ email, name, phone }])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user:', insertError);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in users POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


