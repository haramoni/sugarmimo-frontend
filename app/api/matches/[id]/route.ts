import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await context.params;

  return NextResponse.json(
    { message: "Perfis publicos estao desativados nesta versao." },
    { status: 410 },
  );
}
