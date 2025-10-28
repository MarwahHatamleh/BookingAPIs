import { GetBooksById } from "@/models/lib/db/services/booking";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const user_id = url.searchParams.get("user_id");
    if (!id || !user_id) throw new Error("id and user's id not defined");
    const result = await GetBooksById(+user_id, +id);
    return NextResponse.json(result, {
      status: 200,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({
      status: 404,
      message: `${error.message}`,
    });
  }
};
