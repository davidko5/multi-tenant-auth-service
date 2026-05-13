# MTAS — Multi-Tenant Auth Service

A lightweight, multi-tenant authentication broker. Register your app, redirect users to MTAS for login, and get back an RS256-signed JWT that your backend verifies locally using the MTAS public key. Refresh tokens with rotation and replay detection keep sessions alive without per-request calls to MTAS.

## What is MTAS

MTAS provides OAuth2-inspired auth code exchange for multi-tenant apps. Each registered app (client) gets an isolated user pool — users belong strictly to the client that registered them and are never shared across tenants. The same email can exist under different clients without conflict.

## Architecture

![System Architecture Diagram](apps/mtas-ui/public/mtas-diagram.jpg)

**MTAS** is two services:

- **MTAS UI** — Next.js app where end users log in and tenants manage their settings
- **MTAS API** — NestJS backend handling auth logic, token signing, and tenant management

**Your app** integrates as:

- **Client Frontend** — kicks off login by redirecting users to MTAS UI
- **Client Backend** — exchanges auth codes for tokens, encrypts them into an HttpOnly cookie sent to the browser, and verifies access tokens locally via JWKS

### Data Model

- **Client** — a registered tenant. Has a unique `appId` (UUID), a hashed `appSecret`, and a whitelist of `redirectUris`
- **User** — belongs to exactly one client. Identified by `(email, clientId)` — emails are unique per tenant, not globally
- **AuthCode** — one-time use, 5 min TTL, ties a login attempt to a specific `appId` and `redirectUri`
- **RefreshToken** — opaque (SHA-256 hashed in DB), 7-day TTL, tracked by `familyId` for replay detection

### Tokens

- **Access token**: RS256 JWT, 1 hour TTL. Payload: `{ id, type: 'user', aud: <appId> }`. Signed by MTAS, verified by client backends via JWKS. Includes `aud` so a client backend can reject tokens issued for other tenants.
- **Refresh token**: opaque random string (32 random bytes, hex encoded). 7-day TTL. Stored hashed (SHA-256) in MTAS's DB. Rotated on every use. Members of a token "family" share a `familyId` — if any rotated token is reused, the entire family is revoked (replay detection per RFC 9700).

## Auth Flow (Backend-for-Frontend)

The client backend acts as the OAuth2 confidential party. Tokens are kept out of frontend JS — the client backend encrypts them into an HttpOnly cookie that only it can decrypt. The cookie travels with the browser; its contents are opaque to anything but the backend.

1. **Frontend → MTAS UI**: redirect user to `/user/login?appId=...&redirectUri=...`
2. **MTAS UI → MTAS API**: `POST /user-auth/login` with credentials, `appId`, `redirectUri`
3. **MTAS API → MTAS UI**: returns a one-time auth code (5 min TTL)
4. **MTAS UI → Client Backend**: redirects browser to the registered `redirectUri` (which points at your backend's callback, e.g. `https://api.yourapp.com/auth/callback?auth_code=...`)
5. **Client Backend → MTAS API**: `POST /user-auth/exchange-token` with `{ authCode, redirectUri }`, authenticated with `Authorization: Basic base64(appId:appSecret)`
6. **MTAS API → Client Backend**: returns `{ access_token, refresh_token }`
7. **Client Backend → Browser**: encrypts both tokens into an HttpOnly cookie, redirects browser to the app
8. **Browser → Client Backend**: every subsequent data request includes the cookie automatically. The backend decrypts it, verifies the access token via cached JWKS, and validates `aud` matches its own `appId` before serving the request
9. **On expiry**: client backend calls `POST /user-auth/refresh-token`, gets a new pair, re-encrypts into the cookie. The browser never sees a token at any step.

JWKS is fetched once and cached — no per-request calls to MTAS once the integration is up.

## Token Lifecycle

- **Login** → `/user-auth/login` returns an auth code (one-time, 5 min)
- **Exchange** → `/user-auth/exchange-token` swaps the code for an access + refresh token pair, deletes the auth code
- **Refresh** → `/user-auth/refresh-token` rotates: marks the current refresh token replaced, issues a new pair within the same family
- **Replay detection** → reusing an already-rotated refresh token marks the entire family as revoked. Soft-revoke (`isRevoked = true`), not hard delete, to preserve an audit trail
- **Revoke** → `/user-auth/revoke` (RFC 7009) revokes the entire family. Used on logout. The token itself is the proof of authorization — no Bearer header needed
- **Cleanup** → expired auth codes and refresh tokens are deleted by a 12-hour cron job

Errors from the refresh endpoint return `400 invalid_grant` uniformly (RFC 6749 §5.2) — clients can't distinguish expired vs. revoked vs. invalid, which avoids leaking information to attackers.

## Integration Guide

### 1. Register your app

```
POST /client-auth/register
Body: { "email": "you@example.com", "password": "..." }
```

Log in to the dashboard to find your `appId` and configure redirect URIs.

### 2. Configure redirect URIs and generate a secret

In the dashboard, register every URL where MTAS is allowed to redirect users back to (exact-match validation). For BFF integration the redirect URI should point at your **backend's callback route**. Also add your **frontend origin** — registered URIs double as the CORS allowlist for the MTAS API.

Generate an **app secret** from the dashboard — shown once, used by your backend to authenticate against the token endpoints.

### 3. Backend: handle the callback

When MTAS redirects with `?auth_code=...`:

```
POST /user-auth/exchange-token
Authorization: Basic base64(appId:appSecret)
Body: { "authCode": "<code>", "redirectUri": "<your-callback-url>" }
Response: { "access_token": "<jwt>", "refresh_token": "<opaque>" }
```

Encrypt both tokens into an HttpOnly, `SameSite=Lax`, `Secure` cookie (e.g. via `iron-session`). Redirect the browser to your app's home.

### 4. Backend: verify access tokens on every request

Decrypt the cookie, then verify the JWT:

```
GET /.well-known/jwks.json   # fetched once, cached
```

Verify with RS256 against the JWKS public key. Validate that `aud` matches your `appId`. Libraries: `jwks-rsa` + `jsonwebtoken` (Node), or any JWKS-aware JWT library.

The JWT payload:

```json
{ "id": 42, "type": "user", "aud": "<your-app-id>", "iat": ..., "exp": ... }
```

### 5. Backend: refresh on access token expiry

When verification fails with "expired":

```
POST /user-auth/refresh-token
Authorization: Basic base64(appId:appSecret)
Body: { "refreshToken": "<from-cookie>" }
Response: { "access_token": "<new-jwt>", "refresh_token": "<new-opaque>" }
```

Re-encrypt the new pair into the cookie.

If multiple requests arrive at the moment of expiry, dedupe the refresh call — concurrent requests using the same refresh token will trip replay detection. A simple in-memory promise map keyed by refresh token handles this.

### 6. Logout

```
POST /user-auth/revoke
Authorization: Basic base64(appId:appSecret)
Body: { "refreshToken": "<from-cookie>" }
```

Always returns 200 (RFC 7009). Then clear the cookie. The whole token family is revoked at MTAS.

## API Reference

### User Auth

| Method | Endpoint                        | Auth   | Description                                         |
| ------ | ------------------------------- | ------ | --------------------------------------------------- |
| POST   | `/user-auth/register`           | —      | Register a user under a specific `appId`            |
| POST   | `/user-auth/login`              | —      | Login, returns one-time auth code                   |
| POST   | `/user-auth/exchange-token`     | Basic  | Exchange auth code for access + refresh tokens      |
| POST   | `/user-auth/refresh-token`      | Basic  | Rotate refresh token, get new access + refresh pair |
| POST   | `/user-auth/revoke`             | Basic  | Revoke a refresh token family (RFC 7009)            |
| GET    | `/user-auth/authenticated-user` | Bearer | Get current user profile                            |

### Client Auth (tenant dashboard)

| Method | Endpoint                            | Auth   | Description                               |
| ------ | ----------------------------------- | ------ | ----------------------------------------- |
| POST   | `/client-auth/register`             | —      | Register a new tenant                     |
| POST   | `/client-auth/login`                | —      | Login, sets session cookie                |
| GET    | `/client-auth/authenticated-client` | Cookie | Get tenant profile (returns `hasSecret`)  |
| POST   | `/client-auth/logout`               | Cookie | Logout                                    |
| POST   | `/client-auth/rotate-secret`        | Cookie | Generate/rotate app secret, returned once |

### Management

| Method | Endpoint       | Auth   | Description                            |
| ------ | -------------- | ------ | -------------------------------------- |
| GET    | `/users`       | Bearer | List all users for the caller's tenant |
| PATCH  | `/users/:id`   | Bearer | Update user name                       |
| PATCH  | `/clients/:id` | Cookie | Update tenant `appId` or redirect URIs |

### Public

| Method | Endpoint                 | Description                         |
| ------ | ------------------------ | ----------------------------------- |
| GET    | `/.well-known/jwks.json` | RSA public key for JWT verification |

## Architecture Decisions

- **RS256 + JWKS** for access tokens. Client backends verify locally — no per-request calls to MTAS. Asymmetric keys mean MTAS is the only party that can mint tokens.
- **Opaque refresh tokens, SHA-256 hashed in DB.** They are only ever read by MTAS itself, so JWT self-containment buys nothing here. Hashing protects against DB exfiltration. SHA-256 is the right hash for high-entropy tokens — bcrypt is for passwords.
- **Refresh token rotation with token families.** Every refresh issues a new pair. Reuse of a rotated token = replay = entire family revoked. Aligns with RFC 9700 §4.14.
- **Soft revoke over hard delete.** Family revocation flips `isRevoked = true` rather than deleting rows, keeping an audit trail of compromised sessions until expiry.
- **`aud` claim** in user JWTs. Client backends MUST validate it. Without this, a JWT issued for tenant A would pass JWKS verification at tenant B's backend.
- **Client secrets for confidential clients.** Token endpoints require `Basic base64(appId:appSecret)` — `appId` alone is public (it appears in URLs), so it isn't authentication. Secret is SHA-256 hashed at rest, shown once, rotatable. Required for confidential clients per RFC 6749 §6.
- **BFF as the recommended integration.** The client backend encrypts tokens into an HttpOnly cookie that only it can decrypt; the browser carries an opaque blob. Refresh and revoke are server-side. Frontend is a dumb cookie carrier.

## Planned

- **Public client flow (PKCE)** — for SPAs without a backend. Authorization code with PKCE per RFC 9700 §2.1.1.

## Tech Stack

- **API**: NestJS 11, TypeORM, PostgreSQL, Passport.js, `@nestjs/jwt`, bcrypt, `nestjs-pino`
- **UI**: Next.js 15, React 19, shadcn/ui, React Hook Form, Zod, TanStack Query, Tailwind CSS
- **Infrastructure**: Docker Compose (local Postgres), Coolify (production)

## Running Locally

```bash
git clone <repo-url>
cd multi-tenant-auth-service

# API (port 5010)
cd apps/mtas-api
cp docker.env.example docker.env   # configure PostgreSQL credentials
docker-compose up -d                # start PostgreSQL
npm install
npm run migrate                     # apply TypeORM migrations
npm run start:dev

# UI (port 5011)
cd apps/mtas-ui
npm install
npm run dev
```

Required environment variables for the API: see `app.module.ts` Joi schema (Postgres credentials, `JWT_SECRET`, `JWT_EXPIRATION_TIME`, `ALLOWED_UI_ORIGINS`, `AUTH_CODE_EXPIRATION`). RSA keys for RS256 are read from `private.pem`/`public.pem` files locally, or `JWT_PRIVATE_KEY`/`JWT_PUBLIC_KEY` env vars in cloud deployments (base64 PEM, normalized at boot).
