import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

function isValidPhone(phone: unknown): phone is string {
  return typeof phone === 'string' && phone.trim().length > 0;
}

export async function GET(_req: Request, context: any) {
  try {
    const phoneParam = context?.params?.phone;

    if (!isValidPhone(phoneParam)) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phoneParam)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
