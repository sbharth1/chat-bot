import { getUserSession } from "@/lib/auth/session";
import { NavbarClient } from "./NavbarClient";


export async function Navbar() {
  const userSession = await getUserSession();
  const isAuthenticated = userSession !== null;

  return <NavbarClient isAuthenticated={isAuthenticated} />;
}