// src/app/api/words/route.ts

import { NextResponse } from 'next/server';
import { effWordlist } from '@/src/lib/wordlist';

/**
 * @api {get} /api/words Get the passphrase wordlist
 * @apiDescription This endpoint provides a secure, server-sourced wordlist 
 * for generating strong passphrases on the client-side.
 * Password generation itself remains on the client for maximum security.
 */
export async function GET() {
  try {
    // In a real-world scenario, you might read this from a larger file or database
    return NextResponse.json(effWordlist);
  } catch (error) {
    console.error('Failed to fetch wordlist:', error);
    return NextResponse.json({ error: 'Could not load wordlist' }, { status: 500 });
  }
} 