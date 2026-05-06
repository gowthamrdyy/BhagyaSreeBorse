import { cookies } from "next/headers";

export async function getCookie() {
  const token = (await cookies()).get("token")?.value;
  const user = (await cookies()).get("user")?.value;
  return { token, user };
}
