import { CreateRole, DeleteRole } from "@/models/lib/db/services/roles";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  const body = await request.json();
  const results = await CreateRole(body);
  return NextResponse.json(results, { status: 201 });
};



export const DELETE = async (request: Request) => {
    try {
      const url = new URL(request.url);
      const roleId = url.searchParams.get("roleId");
      if (!roleId) throw new Error("role id not defined");
      const results = await DeleteRole(+roleId);
      return NextResponse.json(results, { status: 200 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return NextResponse.json({ status: 404, message: `${error.message}` });
    }
  };
