import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/RandyGlasgow/react-ripple-effect/main/package.json',
      {
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch package.json');
    }

    const packageJson = await response.json();
    const version = packageJson.version || '0.0.0';

    return NextResponse.json({ version });
  } catch (error) {
    console.error('Error fetching version:', error);
    // Return a fallback version on error
    return NextResponse.json({ version: '0.0.0' }, { status: 500 });
  }
}

