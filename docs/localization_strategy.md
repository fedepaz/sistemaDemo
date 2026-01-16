# Localization Strategy for Prisma and MariaDB

## Chosen Approach: Separate Translation Tables

Based on the research conducted during the planning phase, the primary strategy for storing localized content in the MariaDB database, accessed via Prisma, will be through **Separate Translation Tables**. This approach offers high scalability and maintainability, especially considering the potential for supporting 5-10 additional languages in the future.

### Rationale:
-   **Scalability**: Each translation is stored as a distinct record, making it easy to add new languages without altering the core schema of existing tables.
-   **Maintainability**: Translations are centralized in dedicated tables (`Locale`, `Message`), simplifying management and updates.
-   **Flexibility**: Allows for different translation granularities (e.g., per message key, per entity field).

### Implementation Details:

#### 1. `Locale` Model:
-   Represents the supported languages in the application.
-   **Table**: `locales`
-   **Fields**:
    -   `code` (String, Primary Key, Unique): e.g., "en", "es", "it"
    -   `name` (String): Display name of the locale (e.g., "English", "Español")
    -   `is_active` (Boolean): Flag to enable/disable a locale.

#### 2. `Message` Model:
-   Stores the actual translated strings for various keys.
-   **Table**: `messages`
-   **Fields**:
    -   `id` (String, Primary Key, Unique): The unique key for the message (e.g., "common.greeting", "dashboard.title").
    -   `locale_code` (String): Foreign key referencing `Locale.code`.
    -   `value` (String): The translated string content.

#### 3. `UserPreference` Model:
-   Stores user-specific language preferences.
-   **Table**: `user_preferences`
-   **Fields**:
    -   `user_id` (String, Primary Key, Unique): Links to the user entity.
    -   `preferred_locale_code` (String): Foreign key referencing `Locale.code`.

### Example Prisma Schema (`schema.prisma`):

```prisma
// apps/backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Locale {
  code        String   @id @unique
  name        String
  is_active   Boolean  @default(true)
  messages    Message[]
  user_preferences UserPreference[]

  @@map("locales")
}

model Message {
  id          String   @id @unique
  locale_code String
  value       String
  locale      Locale   @relation(fields: [locale_code], references: [code])

  @@map("messages")
}

model UserPreference {
  user_id           String   @id @unique
  preferred_locale_code String
  locale            Locale   @relation(fields: [preferred_locale_code], references: [code])

  @@map("user_preferences")
}
```

### Considerations for Dynamic Content:

For dynamic content that is stored directly within other entity tables (e.g., a `Plant` entity having a `description` field that needs to be localized), a **hybrid approach** may be considered. This could involve:
-   **JSON Columns**: Storing translations for specific fields as JSON objects within the main entity table (e.g., `description: { en: "...", es: "..." }`). This is suitable for fields with a limited number of languages and where direct querying of individual translations is less critical.
-   **Related Translation Tables**: Creating specific translation tables for complex entities (e.g., `PlantTranslations` with `plant_id`, `locale_code`, `description`, `name`).

For the current language refactor, the `Locale` and `Message` models provide the foundational structure for general UI and system messages. Further documentation will detail the approach for localizing specific entity data as needed.
