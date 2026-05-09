import { getWeatherData } from "@/features/dashboard/api/openMeteo";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await getWeatherData();
    return NextResponse.json(data);
  } catch (_error) {
    return NextResponse.json(
      { error: `Something went wrong fetching the weather data: ${_error}` },
      { status: 500 },
    );
  }
}
