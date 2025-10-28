import { bookTrip, DeleteBooking } from "@/models/lib/db/services/booking";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  try {
    const body = await request.json();

    const result = await bookTrip(body);
    return NextResponse.json(result, {
      status: 201,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({
      message: `${error.message}`,
      status: 404,
    });
  }
};

export const DELETE = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const BookID = url.searchParams.get("BookID");
    if(!BookID) throw new Error("BookID not defined")
    const result = await DeleteBooking(+BookID);
    return NextResponse.json(result, {
      status: 200,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({
      message: `${error.message}`,
      status: 404,
    });
  }
};


