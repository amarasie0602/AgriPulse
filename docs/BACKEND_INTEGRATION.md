# Backend integration guide (NestJS + Prisma + PostgreSQL)

What the AgriPulse frontend expects from the API, and the backend changes needed to support login and registration.

## Endpoints

### `POST /auth/register`

```json
{ "name": "John Doe", "email": "john@example.com", "password": "password123", "farmName": "Green Valley Farm" }
```

`farmName` is optional and only sent when the user fills it in. Any `2xx` response is treated as success; the response body is ignored. The user is then sent to `/login`.

| Status | Meaning                | Message shown to the user                        |
| ------ | ---------------------- | ------------------------------------------------ |
| 201    | Account created        | "Account created. Sign in to continue."          |
| 400    | Validation failed      | "Please check the details you entered and try again." |
| 409    | Email already in use   | "An account with this email already exists."     |
| 429    | Rate limited           | "Too many attempts. Please wait a moment and try again." |
| 5xx    | Server error           | "AgriPulse ran into a problem. Please try again shortly." |

### `POST /auth/login`

```json
{ "email": "john@example.com", "password": "password123" }
```

Response (`200` or `201`):

```json
{
  "access_token": "JWT_TOKEN",
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "FARMER" }
}
```

| Status | Meaning                | Message shown to the user           |
| ------ | ---------------------- | ----------------------------------- |
| 401    | Wrong email or password | "Incorrect email or password."     |
| 400    | Malformed body         | "Please check the details you entered and try again." |
| no response / timeout | Offline, CORS blocked, API down | "Unable to connect to AgriPulse. Please try again." |

Use the same `401` for "unknown email" and "wrong password" so the API does not reveal which emails exist.

## How the frontend talks to NestJS

1. Axios is created once in `src/services/api.ts` with `baseURL = import.meta.env.VITE_API_URL`.
2. `authService.login()` posts to `${VITE_API_URL}/auth/login`; `authService.register()` posts to `${VITE_API_URL}/auth/register`.
3. The email is trimmed and lower-cased before sending, so the backend should store and compare emails in lower case.
4. After login, the token is stored (see the frontend README) and every later request carries `Authorization: Bearer <access_token>`.
5. If a protected endpoint answers `401`, the frontend clears the session and redirects to `/login` with a "session expired" notice.
6. The frontend reads the JWT's `exp` claim (without verifying it) to sign the user out when it expires, so **include `exp`** — `JwtModule` does this when `expiresIn` is set.

## Backend changes required

### 1. Enable CORS for the frontend origin

```ts
// main.ts
app.enableCors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' });
app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
```

`forbidNonWhitelisted` rejects unknown fields with `400`, so the DTO below **must** declare `farmName` or registrations that include it will fail.

### 2. Database: local PostgreSQL only

This project uses a PostgreSQL server installed on your own machine. No online or hosted database service (Supabase, Neon, Railway, RDS and similar) is required or used. In the backend `.env`:

```
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/agripulse?schema=public"
```

Create the database locally first (`createdb agripulse`, or pgAdmin), then run the Prisma migration below. The frontend never talks to the database; it only calls the NestJS API.

### 3. Prisma schema

```prisma
enum Role {
  FARMER
  ADMIN
  ANALYST
}

model User {
  id           Int      @id @default(autoincrement())
  name         String
  email        String   @unique
  passwordHash String
  farmName     String?
  role         Role     @default(FARMER)
  createdAt    DateTime @default(now())
}
```

Then run `npx prisma migrate dev --name add_user_auth`.

### 4. DTOs

```ts
export class RegisterDto {
  @IsString() @MinLength(2) @MaxLength(80) name: string;
  @IsEmail() email: string;
  @IsString() @MinLength(8) @MaxLength(128) password: string;
  @IsOptional() @IsString() @MaxLength(80) farmName?: string;
}

export class LoginDto {
  @IsEmail() email: string;
  @IsString() @IsNotEmpty() password: string;
}
```

### 5. Auth service

```ts
async register(dto: RegisterDto) {
  const passwordHash = await bcrypt.hash(dto.password, 12);
  try {
    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email.toLowerCase(), passwordHash, farmName: dto.farmName },
    });
    return { id: user.id };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new ConflictException('Email already registered'); // -> 409
    }
    throw e;
  }
}

async login(dto: LoginDto) {
  const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
    throw new UnauthorizedException('Invalid credentials'); // -> 401
  }
  const access_token = await this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role });
  return { access_token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}
```

Never return `passwordHash` in a response.

### 6. JWT configuration

```ts
JwtModule.registerAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    secret: config.getOrThrow('JWT_SECRET'),
    signOptions: { expiresIn: '1d' },
  }),
});
```

Keep `JWT_SECRET` and `DATABASE_URL` in the backend `.env` only.

### 7. Recommended extras

- Throttle `/auth/login` and `/auth/register` (`@nestjs/throttler`) — the frontend already handles `429`.
- Add a `JwtAuthGuard` (`passport-jwt`) and a `RolesGuard` with a `@Roles()` decorator for future role-based endpoints.
- Optional `GET /auth/me` to validate a stored token on startup.
- Optional: set the JWT in an `httpOnly` cookie instead of returning it in the body (see the frontend README).
