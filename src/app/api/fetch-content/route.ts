
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const urlString = searchParams.get('url');

  if (!urlString) {
    return NextResponse.json({ error: 'URL parameter is missing' }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlString);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Invalid protocol. Only HTTP and HTTPS are allowed.');
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid URL format or protocol.' }, { status: 400 });
  }

  try {
    // Set a timeout for the fetch request (e.g., 10 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        // Emulate a common browser user agent to avoid simple blocks
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      // Try to get error message from target server if available
      let errorBody = `Failed to fetch content. Status: ${response.status}`;
      try {
          const textError = await response.text();
          if(textError.length < 500) { // Avoid overly long error messages
            errorBody = `Failed to fetch content. Status: ${response.status}. Server message: ${textError.substring(0,200)}`;
          }
      } catch (e) {
        // ignore if can't read body
      }
      return NextResponse.json({ error: errorBody }, { status: response.status });
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/html')) {
      // If not HTML, still return content but AI might not process it well.
      // Or, one could choose to return an error here.
      // For now, let's proceed but the AI analysis might be suboptimal.
    }

    const content = await response.text();
    
    // Basic check for excessively large content to prevent issues.
    // 5MB limit for this example.
    if (content.length > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Content too large to process (max 5MB).' }, { status: 413 });
    }


    return NextResponse.json({ content });

  } catch (error: any) {
    console.error(`Error fetching URL (${urlString}):`, error);

    let reportableErrorMessage: string;

    if (error.name === 'AbortError') {
      reportableErrorMessage = 'Request timed out while fetching content.';
      return NextResponse.json({ error: reportableErrorMessage }, { status: 504 });
    }

    let diagnostics = '';
    if (error.message) {
      diagnostics += error.message;
    }

    // Check for Node.js style error codes directly on the error or its cause
    const nodeErrorCode = error.code || (error.cause && typeof error.cause === 'object' && error.cause.code);
    if (nodeErrorCode) {
      diagnostics += ` (Code: ${nodeErrorCode})`;
    } else if (error.cause && typeof error.cause === 'object' && error.cause.message) {
      // Fallback to cause message if no specific code but cause exists
      diagnostics += ` (Cause: ${error.cause.message})`;
    } else if (error.cause && typeof error.cause === 'string') {
      // Handle if cause is just a string
       diagnostics += ` (Cause: ${error.cause})`;
    }


    if (diagnostics) {
      reportableErrorMessage = `Error fetching '${urlString}': ${diagnostics}.`;
    } else {
      reportableErrorMessage = `An unknown error occurred while fetching '${urlString}'.`;
    }

    return NextResponse.json({ error: reportableErrorMessage }, { status: 500 });
  }
}
