import { NextRequest } from "next/server";
import { GET as cobrofacilGet } from "../cobrofacil/[...path]/route";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return cobrofacilGet(request, { params: Promise.resolve({ path: ["companies"] }) });
}
