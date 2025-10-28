import { Login } from "@/models/lib/db/services/users";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  try {
    
    const {email , password} = await request.json();
    const result = await Login(email , password);
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
