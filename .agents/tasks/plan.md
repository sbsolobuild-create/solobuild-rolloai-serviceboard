# Implementation Plan — Redesign Auth UI to match /Auth reference

Redesign the live auth UI in `src/pages/AuthPage.tsx` to match the reference design
in `Frontend/Auth/` (`SignIn.tsx`, `SignUp.tsx`, `auth.css`). Preserve all backend
integration and behavior; change only look, layout, and component structure.

All paths below are relative to `e:/SoloBuildAI Complete/Frontend`.

---

## Decisions (with rationale)

1. **Structure: split into two routes `/login` (SignIn) and `/signup` (SignUp).**
   The reference ships separate `SignIn`/`SignUp` components that navigate between
   each other via `<Link to="/signup">` / `<Link to="/signin">`. Splitting into two
   routes is the closest match to that design (separate components + Link navigation)
   while keeping the route guard intact. The guard in `App.tsx` still redirects to
   `/login`, so `/login` stays the canonical sign-in entry (its path is unchanged).
   Rationale: a single toggling AuthPage would force the reference's `<Link>`-based
   navigation into an internal toggle button, diverging from the reference structure.

2. **Keep exactly two public auth routes (`/login`, `/signup`).** The reference's
   SignUp footer links to `/signin`; change that link target to `/login` so it points
   at the canonical sign-in route (no redundant `/signin` route). SignIn's subtitle
   keeps `<Link to="/signup">` as-is.

3. **CSS strategy: copy `Auth/auth.css` → `src/styles/auth.css` and import it once in
   `App.tsx`** (`import './styles/auth.css';`), alongside the existing
   `global.css` / `sales-qualification.css` imports. Rationale: matches the project's
   "page-specific CSS in `src/styles/` imported in App.tsx" precedent
   (`sales-qualification.css` is page-specific yet globally imported). `auth.css` is
   fully scoped under `.auth-*` classes (verified: no `.auth-`/`--auth-` names exist in
   `src/styles/*.css`), so global import has zero bleed.

4. **Logo: create `src/components/ui/SoloBuildLogo.tsx`** rendering
   `<img src="/solobuild-logo.png" ...>` at a given `height`. The reference imports
   `SoloBuildLogo` from `../../components/ui/SoloBuildLogo`, but no such component
   exists today. The PNG asset `/solobuild-logo.png` already exists in `public/` and is
   already used by `Sidebar.tsx`, so this reuses the established brand asset. The
   `SoloBuildLogo` component renders that `<img>` with an `alt` and the passed height;
   `auth.css` already styles `.auth-logo img` / `.auth-logo svg` at 52px.

5. **Errors: keep the reference's inline `.auth-error` box AND preserve the existing
   toast-on-submit-error.** Validation errors (password mismatch on signup) show in
   the inline `.auth-error` box (matches the reference's error element). Submit/backend
   errors show BOTH in the inline box (matches reference's `setError` on submit
   failure) AND as `showToast(msg, 'error')` (preserves existing AuthPage behavior).
   The minor redundancy is acceptable: toast is attention-grabbing and auto-dismisses;
   inline persists in context.

6. **Validation: use the reference's native-HTML-validation approach.** Inputs get
   `required`, `type="email"`, `minLength={8}` (preserving the existing validation
   rules: required, valid email, password min 8) plus a JS password-mismatch check on
   signup (new, for the confirm field) shown in the inline `.auth-error` box. The old
   per-field JS `validate()` + per-field red-border display is replaced by native
   validation + the single inline error box — a presentation change (allowed; only
   look/layout/structure change), with the validation rules preserved.

7. **Submission: use `useAuth().login` / `useAuth().register`** (NOT the reference's
   direct `authService.login`/`register` calls — the reference calls them with wrong
   positional args anyway; the real `authService.register` takes a `RegisterPayload`
   object). Call `login({ email, password })` and
   `register({ name, email, password, timezone })` exactly as the current AuthPage
   does. Drop the reference's `onLoginSuccess` prop — `useAuth` sets the user; the
   route guard then admits the post-login `navigate('/')`.

8. **timezone: preserve existing `'UTC'`.** The current AuthPage sends
   `timezone: 'UTC'`; the reference detects via `Intl.DateTimeFormat`. Keep `'UTC'` to
   strictly honor "preserve behavior" (timezone value is behavior, not styling).
   Documented deviation from the reference mock.

9. **On success: `navigate('/', { replace: true })`.** The current AuthPage uses
   `navigate('/')` (push); the reference uses `replace: true`. Use `replace: true`
   (matches reference, prevents the back button returning to the auth screen). Minor,
   defensible UX improvement; does not affect integration.

10. **OAuth (Google/Microsoft) and "Forgot password?" buttons: render as inert
    placeholders matching the reference.** The reference gives them `type="button"` and
    NO `onClick`; there is no OAuth or password-reset backend in this repo. Reproduce
    them exactly (no handlers) so the design matches and no new behavior/backend is
    introduced. Add a brief code comment noting they are UI placeholders pending
    backend OAuth / reset flows.

11. **"Remember me" checkbox: reproduce the reference's behavior** — on successful
    login, if checked, store the email in `localStorage` under `'remember_user'`
    (matches the reference's `localStorage.setItem('remember_user', email)`). Harmless
    client-side; the reference does not read it back, so no pre-fill is added.

12. **Background image: `auth.css` references `/auth-bg.png`, which is absent from
    `public/`.** The page falls back to the dark `#0d0d0f` background color declared in
    `auth.css`, so the dark-glass aesthetic still renders. To get the full
    background-image effect the reference intends, add `public/auth-bg.png` later —
    out of scope for code changes; noted as an asset gap.

13. **Delete `src/pages/AuthPage.tsx` after rewiring.** Only `App.tsx` imports it
    (verified). It is fully replaced by `SignIn`/`SignUp`. Removing it avoids dead
    code. (`Auth/` reference mock is left untouched — it lives outside `src` and is
    not compiled by `tsc -b` since `tsconfig.app.json` includes only `src`.)

---

## Behaviors preserved from the current AuthPage (verify each still works)

- Sign-in submit → `useAuth().login({ email, password })`.
- Sign-up submit → `useAuth().register({ name, email, password, timezone: 'UTC' })`.
- Submit failure → `showToast(msg, 'error')` where `msg = err.message || 'Something went wrong'`.
- Submit success → navigate to `/` (the guarded home renders because `useAuth` set the user).
- Loading state → submit button `disabled` while submitting; button label flips to
  `Signing In…` / `Creating Account…`.
- Validation rules: required fields, valid email, password ≥ 8 characters
  (enforced via native HTML attributes); password-confirm match on signup (JS, inline).
- `autoComplete` attributes: signin `email`/`current-password`; signup `name`/`email`/
  `new-password` (password + confirm).
- Ability to switch between sign-in and sign-up — now via `<Link>` between `/login` and
  `/signup` (was an in-page toggle; structure changed to match the reference).
- Route guard still redirects unauthenticated users to `/login` (unchanged).

## New elements reproduced from the reference (visual/structural match)

- `SoloBuildLogo` at top of each card; glass card on dark background with overlay.
- SignIn: title + subtitle (with "Sign up" link to `/signup`), Google + Microsoft OAuth
  buttons, "or continue with" divider, email + password fields, inline error box,
  "Remember me" + "Forgot password?" row, primary submit button.
- SignUp: title + subtitle, 2-column `.auth-form-grid` (Full Name, Work Email, Password,
  Confirm Password), inline error box, primary submit button, footer "Sign in" link
  (to `/login`).

---

## Implementation steps (ordered by dependency; each leaves the codebase buildable)

- [ ] 1. Scaffold the shared auth assets: create the `SoloBuildLogo` component and add
      the auth stylesheet to `src/styles/`.
      - Create `src/components/ui/SoloBuildLogo.tsx`: a default-exported
        `React.FC<{ height?: number }>` rendering
        `<img src="/solobuild-logo.png" alt="SoloBuildAI" height={height ?? 52} />`
        (reuses the existing `public/solobuild-logo.png` already used by `Sidebar.tsx`).
        Follow the `React.FC` + `import React` pattern used across `src/components/ui`
        (keeps `React` used so `noUnusedLocals` is satisfied).
      - Copy `Auth/auth.css` verbatim into `src/styles/auth.css` (do not edit the rules;
        its `--auth-*` custom properties and `.auth-*` classes are additive and verified
        collision-free against existing stylesheets).
      - Files: `src/components/ui/SoloBuildLogo.tsx` (new), `src/styles/auth.css` (new).
      - Verify: `npx tsc -b` — completes with no type errors (the new component compiles;
        `src/styles/auth.css` is not typechecked but must exist for the next step).

- [ ] 2. Create the `SignIn` page component (adapted from `Auth/SignIn.tsx`).
      - Reproduce the reference markup/classes exactly (`.auth-page`,
        `.auth-card.auth-card--signin`, `.auth-logo`, `.auth-title`, `.auth-subtitle`,
        `.auth-social-row` with `GoogleIcon`/`MicrosoftIcon` inline SVGs, `.auth-divider`,
        `.auth-form`, `.auth-field`, `.auth-input`, `.auth-error`, `.auth-row`,
        `.auth-remember`, `.auth-forgot`, `.auth-primary-button`).
      - Adaptations vs. the reference mock:
        - `import { useAuth } from '../context/AuthContext'` and call
          `const { login } = useAuth()`; submit via `login({ email, password })`
          (NOT the reference's direct `authService.login`).
        - `import { useToast } from '../components/ui/Toast'`; `const { showToast } = useToast()`.
        - `import SoloBuildLogo from '../components/ui/SoloBuildLogo'` and render
          `<SoloBuildLogo height={52} />` (fixes the reference's missing import).
        - Keep local `useState` for `email`, `password`, `remember`, `error`,
          `isSubmitting`. Drop the reference's `onLoginSuccess` prop entirely.
        - On submit success: `navigate('/', { replace: true })`.
        - On submit error: set inline `error` AND `showToast(msg, 'error')` where
          `msg = err instanceof Error ? err.message : 'Something went wrong'`.
        - Validation via native HTML attrs (`required`, `type="email"`,
          `autoComplete="email"`, password `required` `autoComplete="current-password"`).
        - "Remember me": on success, if `remember`, `localStorage.setItem('remember_user', email)`.
        - Subtitle link stays `<Link to="/signup">Sign up</Link>`.
        - OAuth + "Forgot password?" buttons: render with `type="button"`, NO `onClick`
          (inert placeholders matching the reference); add a one-line comment noting
          they await backend OAuth/reset flows.
      - Files: `src/pages/SignIn.tsx` (new).
      - Verify: `npx tsc -b` — compiles with no type errors (depends on step 1:
        `SoloBuildLogo` exists; uses `import type` for any type-only imports per
        `verbatimModuleSyntax`).

- [ ] 3. Create the `SignUp` page component (adapted from `Auth/SignUp.tsx`).
      - Reproduce the reference markup/classes exactly (`.auth-card.auth-card--signup`,
        2-column `.auth-form-grid` with Full Name / Work Email / Password / Confirm
        Password, `.auth-error`, `.auth-primary-button`, `.auth-footer`).
      - Adaptations vs. the reference mock:
        - `const { register } = useAuth()`; submit via
          `register({ name: fullName, email, password, timezone: 'UTC' })` (object
          payload; `timezone: 'UTC'` preserves existing behavior — do NOT use the
          reference's `Intl` detection).
        - `const { showToast } = useToast()`; on submit error set inline `error` AND
          `showToast(msg, 'error')` (`msg = err.message || 'Something went wrong'`).
        - `import SoloBuildLogo from '../components/ui/SoloBuildLogo'`.
        - Keep `useState` for `fullName`, `email`, `password`, `confirmPassword`,
          `error`, `isSubmitting`. Drop `onLoginSuccess`.
        - JS password-mismatch check before submitting: if
          `password !== confirmPassword`, set inline `error = 'Passwords do not match.'`
          and return (no toast for this validation error).
        - Native attrs: name `required autoComplete="name"`; email `required type="email"`;
          password `required minLength={8} autoComplete="new-password"`; confirm
          `required minLength={8} autoComplete="new-password"`.
        - On success: `navigate('/', { replace: true })`.
        - Footer link: `<Link to="/login">Sign in</Link>` (changed from the reference's
          `/signin` to point at the canonical `/login` route — keeps exactly two routes).
      - Files: `src/pages/SignUp.tsx` (new).
      - Verify: `npx tsc -b` — compiles with no type errors.

- [ ] 4. Wire the new routes and the CSS import in `App.tsx`; stop importing `AuthPage`.
      - Replace `import AuthPage from './pages/AuthPage';` with
        `import SignIn from './pages/SignIn';` and `import SignUp from './pages/SignUp';`.
      - In the `<Routes>` block, replace `<Route path="/login" element={<AuthPage />} />`
        with `<Route path="/login" element={<SignIn />} />` and add
        `<Route path="/signup" element={<SignUp />} />` immediately after it (both
        public, BEFORE the `/*` guarded block — same position the `/login` route
        already occupies).
      - Leave `RequireAuth`'s `<Navigate to="/login" ... />` exactly as-is (guard
        behavior unchanged).
      - In the `// Styles` section, add `import './styles/auth.css';` after
        `import './styles/sales-qualification.css';`.
      - Files: `src/App.tsx` (modify).
      - Verify: `npm run build` (`tsc -b && vite build`) — succeeds; bundle includes
        the new pages; no unresolved imports.

- [ ] 5. Delete the now-unused old auth page.
      - Delete `src/pages/AuthPage.tsx` (only `App.tsx` imported it; step 4 removed that
        import, so deletion is safe).
      - Files: `src/pages/AuthPage.tsx` (delete).
      - Verify: `npm run build` — succeeds with no "Cannot find module" errors and no
        new type errors.

- [ ] 6. Final verification — typecheck/build, lint, and dev-server functional + visual checks.
      - `npm run build` — `tsc -b && vite build` passes, strict-clean (no new TS errors;
        confirm `verbatimModuleSyntax`/`noUnusedLocals`/`noUnusedParameters` are
        satisfied in the new files).
      - `npm run lint` (oxlint) — no new lint errors in the touched files.
      - `npm run dev`, then in the browser:
        - Visit `/login`: layout, spacing, colors, typography, logo, OAuth buttons,
          divider, fields, remember/forgot row match `Auth/SignIn.tsx` + `Auth/auth.css`.
        - Visit `/signup`: 2-column grid, fields, footer link match `Auth/SignUp.tsx`.
        - Click "Sign up" link on `/login` → navigates to `/signup`; click "Sign in"
          link on `/signup` → navigates to `/login` (mode-switch behavior preserved).
        - Submit empty/invalid form → native validation blocks submit (required/email
          /minLength enforced).
        - On `/signup`, enter mismatched passwords → submit shows inline
          `.auth-error` "Passwords do not match." and does not call the API.
        - Submit real wrong credentials → error toast appears (`useToast`) and inline
          `.auth-error` shows the backend message.
        - Submit valid credentials → `useAuth().login`/`register` called, then
          `navigate('/')` lands on the authenticated home (route guard passes).
        - While submitting → primary button is `disabled` and label reads
          `Signing In…` / `Creating Account…` (loading state preserved).
        - Check "Remember me" + successful login → `localStorage['remember_user']` set.
        - Hit `/` while logged out → guard redirects to `/login` (guard intact).
      - Files: none (verification only).
      - Verify: all commands above pass and the dev-server checks behave as described.

---

## Notes / gaps (assumptions, not blockers)

- `/auth-bg.png` is referenced by `auth.css` but absent from `public/`. The page
  renders with the dark fallback color; add `public/auth-bg.png` later for the
  background image. No code change required for the redesign to look correct.
- OAuth and "Forgot password?" are visual placeholders (no backend exists); left
  inert intentionally to match the reference mock and avoid introducing backend calls.
- `timezone` is sent as `'UTC'` (existing behavior) rather than the reference's
  `Intl`-detected value, to preserve existing behavior per the task brief.
