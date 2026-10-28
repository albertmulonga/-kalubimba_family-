import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
const token = await new SignJWT({
  id: Number(process.argv[2] ?? 1),
  nom: "Test",
  prenom: "Utilisateur",
  email: process.argv[3] ?? null,
  matricule: null,
  isAdmin: process.argv[4] === "admin",
})
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("7d")
  .sign(secret);
console.log(token);
