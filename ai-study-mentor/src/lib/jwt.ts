import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

/**
 * Genererar en JWT token för användaren
 * @param userId - Användarens ID från databasen
 * @returns JWT token som sträng
 */
export function generateToken(userId: string): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET miljövariabel saknas");
  }

  if (!userId) {
    throw new Error("Användar-ID krävs för att generera token");
  }

  try {
    const token = jwt.sign({ userId }, secret, {
      expiresIn: "7d", // Token gäller i 7 dagar
      issuer: "ai-study-mentor",
      audience: "ai-study-mentor-users",
    });

    return token;
  } catch {
    throw new Error("Kunde inte generera autentiseringstoken");
  }
}

/**
 * Verifierar och dekoderar en JWT token
 * @param token - JWT token att verifiera
 * @returns Dekodad payload med användar-ID
 */
export function verifyToken(token: string): JWTPayload {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET miljövariabel saknas");
  }

  if (!token) {
    throw new Error("Token krävs för verifiering");
  }

  try {
    const decoded = jwt.verify(token, secret, {
      issuer: "ai-study-mentor",
      audience: "ai-study-mentor-users",
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Autentiseringstoken har gått ut. Logga in igen.");
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Ogiltig autentiseringstoken");
    } else {
      throw new Error("Kunde inte verifiera autentiseringstoken");
    }
  }
}

/**
 * Extraherar JWT token från HTTP-request
 * @param request - NextRequest objekt
 * @returns JWT token som sträng eller null om ingen token hittas
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  // Kolla Authorization header först
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7); // Ta bort "Bearer " prefix
  }

  // Kolla cookies som backup
  const token = request.cookies.get("auth-token")?.value;
  if (token) {
    return token;
  }

  return null;
}

/**
 * Hjälpfunktion för att verifiera autentisering från request
 * @param request - NextRequest objekt
 * @returns Dekodad payload med användar-ID
 */
export function getAuthenticatedUser(request: NextRequest): JWTPayload {
  const token = getTokenFromRequest(request);

  if (!token) {
    throw new Error("Ingen autentiseringstoken hittades. Du måste logga in.");
  }

  return verifyToken(token);
}

/**
 * Middleware helper för att skydda API routes
 * @param request - NextRequest objekt
 * @returns Promise som resolvar med användar-ID eller kastar fel
 */
export async function requireAuth(request: NextRequest): Promise<string> {
  try {
    const payload = getAuthenticatedUser(request);
    return payload.userId;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Autentisering krävs: ${error.message}`);
    }
    throw new Error("Autentisering krävs för att komma åt denna resurs");
  }
}
