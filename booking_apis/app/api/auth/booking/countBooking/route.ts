import { GetCountBookingByDes } from "@/models/lib/db/services/booking";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const result = await GetCountBookingByDes();
    return NextResponse.json(result, {
      status: 200,
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error : any) {
    return NextResponse.json({
      status: 404,
      message : `${error.message}`
    });
  }
};
