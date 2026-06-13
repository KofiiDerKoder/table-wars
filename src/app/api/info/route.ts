export const dynamic = 'force-static';

export async function GET() {
  return Response.json({
    name: "Table Wars!",
    version: "0.1.0",
    platform: typeof window !== 'undefined' && 'isTauri' in window ? 'desktop' : 'web',
    description: "Competition management platform"
  });
}
