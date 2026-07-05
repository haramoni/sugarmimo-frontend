import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "A busca de perfis esta desativada nesta versao." },
    { status: 410 },
  );
}
