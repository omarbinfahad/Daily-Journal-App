# LingoSwipe

Mobile-first language learning app built with Expo + React Native.

## Firebase Setup (Step-by-Step)

### 1) Create Firebase project

1. Go to `https://console.firebase.google.com/`
2. Click **Add project** -> name it `LingoSwipe`
3. In project dashboard, create a **Web app** and copy its config

### 2) Enable required services

In Firebase Console, enable:

- **Authentication**
  - Sign-in methods: **Email/Password** and **Anonymous**
- **Firestore Database**
  - Create database (start in test mode for development)
- **Storage**
  - Create default bucket

### 3) Add client Firebase config to app

Open `src/config/firebase.ts` and replace placeholders:

- `YOUR_API_KEY`
- `YOUR_AUTH_DOMAIN`
- `YOUR_PROJECT_ID`
- `YOUR_STORAGE_BUCKET`
- `YOUR_MESSAGING_SENDER_ID`
- `YOUR_APP_ID`

### 4) Add admin key for seed script

The seed script uses `firebase-admin`.

1. Firebase Console -> **Project settings** -> **Service accounts**
2. Click **Generate new private key** and download the JSON
3. Save it in project root as:
   - `serviceAccountKey.json`
   - (You can copy from `serviceAccountKey.example.json` as structure reference)

Alternative:

- Keep key anywhere and run with env var:
  - `GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/to/key.json" npm run seed`

### 5) Seed initial data

```bash
npm run seed
```

If key is missing, script shows setup instructions.

### 6) Run app

```bash
npx expo start
```

### Optional: DeepL Translation + TTS keys

Copy `.env.example` to `.env` and set:

- `EXPO_PUBLIC_DEEPL_API_KEY`
- `EXPO_PUBLIC_DEEPL_API_URL` (use `https://api-free.deepl.com/v2/translate` for DeepL Free)
- `EXPO_PUBLIC_GOOGLE_TTS_API_KEY`

### Firebase Auth env values

From Firebase Console -> Project settings -> Your apps -> Web app config:

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

### Google Sign-In setup (Firebase Auth)

1. Firebase Console -> Authentication -> Sign-in method -> Google -> Enable.
2. Add your Android app SHA-1 in Firebase:
   - Firebase Console -> Project settings -> Your apps -> Android app -> Add fingerprint.
3. In Google Cloud Console -> APIs & Services -> Credentials, create OAuth client IDs.
4. Put client IDs in `.env`:
   - `EXPO_PUBLIC_FIREBASE_GOOGLE_WEB_CLIENT_ID`
   - `EXPO_PUBLIC_FIREBASE_GOOGLE_ANDROID_CLIENT_ID`
   - `EXPO_PUBLIC_FIREBASE_GOOGLE_IOS_CLIENT_ID`

---

## Starter Security Rules (Development Baseline)

Use these as a starting point and tighten before production.

### Firestore Rules

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read for language content; write only by admins (via Admin SDK/server)
    match /languages/{languageId} {
      allow read: if true;
      allow write: if false;

      match /{subCollection=**}/{docId} {
        allow read: if true;
        allow write: if false;
      }
    }

    // Each user can read/write only their own progress
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Storage Rules

```txt
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Audio assets are readable to authenticated users
    match /audio/{languageId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

---

## Notes

- `serviceAccountKey.json` is ignored by git.
- Use `firebase-admin` only in scripts/server contexts, never in app runtime.
- For production, migrate config values to environment variables.

---

## Android Release Prep

### EAS build setup

1. Install and login:
   - `npm install -g eas-cli`
   - `eas login`
2. Configure project:
   - `eas build:configure`
3. Build preview APK:
   - `eas build --platform android --profile preview`
4. Build production AAB:
   - `eas build --platform android --profile production`

### Play Store asset checklist

- **Phone screenshots:** at least 2 (recommended 6-8), portrait `1080x1920` to `1080x2340`
- **Feature graphic:** `1024x500`
- **App icon:** `512x512` (Play listing) and `1024x1024` source master
- **Screens to capture:** onboarding, home, word card, phrase card, favorites, progress

### Store listing copy

- **Short description (<=80 chars)**  
  `Swipe to learn languages. Master words & phrases in bite-sized lessons daily.`

- **Full description**  
  `LingoSwipe helps you build language fluency with fast, swipeable lessons designed for daily practice.

Learn smarter with:
- Swipe-based word and phrase cards
- Pronunciation audio playback
- Favorites to review key vocabulary
- Progress stats and streak tracking
- Structured weekly lesson paths

Practice in short sessions, stay consistent with daily goals, and build confidence one card at a time.

Whether you are starting from scratch or improving your vocabulary, LingoSwipe keeps learning simple, engaging, and effective.`
# lingo
