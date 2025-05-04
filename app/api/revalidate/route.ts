import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const paths = searchParams.getAll("path")

    if (paths.length === 0) {
      return NextResponse.json({ message: "No paths provided for revalidation" }, { status: 400 })
    }

    // Revalidate all provided paths
    for (const path of paths) {
      try {
        revalidatePath(path)
        console.log(`Successfully revalidated path: ${path}`)
      } catch (pathError) {
        console.error(`Error revalidating path ${path}:`, pathError)
        // Continue with other paths even if one fails
      }
    }

    return NextResponse.json({
      revalidated: true,
      message: `Paths ${paths.join(", ")} revalidation attempted`,
    })
  } catch (error) {
    console.error("Error in revalidation route:", error)
    return NextResponse.json({ message: "Error revalidating", error: String(error) }, { status: 500 })
  }
}
