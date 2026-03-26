import { NextRequest, NextResponse } from "next/server";
import { getServerSideConfig } from "../../config/server";
import md5 from "spark-md5";

async function handle(req: NextRequest) {
  const body = await req.json();
  const accessCode = (body.accessCode || "").trim();
  const serverConfig = getServerSideConfig();

  // If no access code is required, always valid
  if (!serverConfig.needCode) {
    return NextResponse.json({ valid: true });
  }

  if (!accessCode) {
    return NextResponse.json({ valid: false, message: "请输入访问密码" });
  }

  const hashedCode = md5.hash(accessCode).trim();
  const isValid = serverConfig.codes.has(hashedCode);

  if (!isValid) {
    console.log("[Verify] invalid access code attempt:", accessCode);
    return NextResponse.json({ valid: false, message: "访问密码错误" });
  }

  console.log("[Verify] access code verified successfully");
  return NextResponse.json({ valid: true });
}

export const POST = handle;

export const runtime = "edge";
