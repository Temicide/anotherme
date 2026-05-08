import { NextResponse } from "next/server";
import { runSimulation } from "@/lib/pool";
import { simulateDimension } from "@/lib/ollama";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.habits || typeof body.habits !== "object") {
      return NextResponse.json(
        { error: "Missing or invalid 'habits' field" },
        { status: 400 }
      );
    }

    const result = await runSimulation(body.habits, {
      simulateFn: simulateDimension,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
