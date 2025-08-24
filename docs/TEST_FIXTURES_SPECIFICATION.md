# Test Fixtures Specification

## Overview

This document specifies the structure, organization, and usage of test fixtures in the lokalise-mcp project. Fixtures provide realistic test data based on actual Lokalise API responses.

## Directory Structure

```
src/
├── test-utils/
│   ├── fixtures/
│   │   ├── common/           # Shared fixtures
│   │   ├── errors/           # Error response fixtures
│   │   └── pagination/       # Pagination fixtures
│   └── fixture-helpers/       # Fixture utility functions
└── domains/
    └── [domain]/
        └── __fixtures__/
            └── [domain].fixtures.ts
```

## Fixture Organization

### Domain-Specific Fixtures

Each domain maintains its own fixtures in `__fixtures__/[domain].fixtures.ts`:

```typescript
// src/domains/projects/__fixtures__/projects.fixtures.ts
import type { Project, PaginatedResult } from "@lokalise/node-api";

// Single entity fixtures
export const projectFixture: Project = {
  project_id: "803826145ba90b42d5d860.46800099",
  project_type: "localization_files",
  name: "Demo Project",
  description: "Test project for unit tests",
  created_at: "2024-01-15 10:30:00 (Etc/UTC)",
  created_at_timestamp: 1705316400,
  created_by: 20181,
  created_by_email: "test@example.com",
  team_id: 176692,
  team_uuid: "9ef160a0-d4c7-45f5-ab80-bc9e22e95b12",
  base_language_id: 640,
  base_language_iso: "en",
  settings: {
    per_platform_key_names: false,
    reviewing: true,
    auto_toggle_unverified: true,
    offline_translation: true,
    key_editing: true,
    inline_machine_translations: true,
    branching: true,
    segmentation: false,
    contributor_preview_download_enabled: false,
    custom_translation_statuses: false,
    custom_translation_statuses_allow_multiple: false
  },
  statistics: {
    progress_total: 65,
    keys_total: 124,
    team: 5,
    base_words: 1567,
    qa_issues_total: 23,
    qa_issues: {
      not_reviewed: 12,
      unverified: 8,
      spelling_grammar: 3,
      inconsistent_placeholders: 0,
      inconsistent_html: 0,
      different_number_of_urls: 0,
      different_urls: 0,
      leading_whitespace: 0,
      trailing_whitespace: 0,
      different_number_of_email_address: 0,
      different_email_address: 0,
      different_brackets: 0,
      different_numbers: 0,
      double_space: 0,
      special_placeholder: 0,
      unbalanced_brackets: 0
    },
    languages: [
      {
        language_id: 640,
        language_iso: "en",
        progress: 100,
        words_to_do: 0
      },
      {
        language_id: 673,
        language_iso: "fr",
        progress: 75,
        words_to_do: 392
      },
      {
        language_id: 597,
        language_iso: "ru",
        progress: 45,
        words_to_do: 862
      }
    ]
  }
};

// Collection fixtures
export const projectsListFixture: PaginatedResult<Project> = {
  items: [
    projectFixture,
    {
      ...projectFixture,
      project_id: "43820238650c56462a27f0.61419394",
      name: "Mobile App",
      description: "iOS and Android app localization",
      statistics: {
        ...projectFixture.statistics,
        keys_total: 256,
        progress_total: 82
      }
    }
  ],
  totalResults: 2,
  totalPages: 1,
  resultsPerPage: 100,
  currentPage: 1,
  hasNextPage: () => false,
  hasPrevPage: () => false,
  nextPage: () => 2,
  prevPage: () => 0
};

// Factory functions
export function createProjectFixture(overrides: Partial<Project> = {}): Project {
  return {
    ...projectFixture,
    ...overrides,
    settings: {
      ...projectFixture.settings,
      ...(overrides.settings || {})
    },
    statistics: {
      ...projectFixture.statistics,
      ...(overrides.statistics || {})
    }
  };
}

export function createProjectsListFixture(
  options: {
    count?: number;
    page?: number;
    limit?: number;
    projects?: Partial<Project>[];
  } = {}
): PaginatedResult<Project> {
  const { count = 2, page = 1, limit = 100, projects = [] } = options;
  
  const items = projects.length > 0
    ? projects.map(p => createProjectFixture(p))
    : Array.from({ length: count }, (_, i) => 
        createProjectFixture({
          project_id: `project_${i + 1}`,
          name: `Project ${i + 1}`
        })
      );

  const totalResults = items.length;
  const totalPages = Math.ceil(totalResults / limit);

  return {
    items: items.slice((page - 1) * limit, page * limit),
    totalResults,
    totalPages,
    resultsPerPage: limit,
    currentPage: page,
    hasNextPage: () => page < totalPages,
    hasPrevPage: () => page > 1,
    nextPage: () => page + 1,
    prevPage: () => page - 1
  };
}
```

## Fixture Types

### 1. Keys Domain Fixtures

```typescript
// src/domains/keys/__fixtures__/keys.fixtures.ts
import type { Key, Translation } from "@lokalise/node-api";

export const keyFixture: Key = {
  key_id: 15519786,
  created_at: "2024-01-20 14:22:33 (Etc/UTC)",
  created_at_timestamp: 1705761753,
  key_name: {
    ios: "app.welcome.title",
    android: "welcome_title",
    web: "WELCOME_TITLE",
    other: "app.welcome.title"
  },
  filenames: {
    ios: "Localizable.strings",
    android: "strings.xml",
    web: "en.json",
    other: "translations.yml"
  },
  description: "Welcome screen title",
  platforms: ["ios", "android", "web"],
  tags: ["ui", "onboarding"],
  comments: [],
  screenshots: [],
  translations: [
    {
      translation_id: 444921322,
      key_id: 15519786,
      language_iso: "en",
      modified_at: "2024-01-20 14:22:33 (Etc/UTC)",
      modified_at_timestamp: 1705761753,
      modified_by: 20181,
      modified_by_email: "test@example.com",
      translation: "Welcome to Our App",
      is_unverified: false,
      is_reviewed: true,
      reviewed_by: 20181,
      words: 4,
      custom_translation_statuses: []
    },
    {
      translation_id: 444921323,
      key_id: 15519786,
      language_iso: "fr",
      modified_at: "2024-01-21 09:15:22 (Etc/UTC)",
      modified_at_timestamp: 1705829722,
      modified_by: 20182,
      modified_by_email: "translator@example.com",
      translation: "Bienvenue dans notre application",
      is_unverified: false,
      is_reviewed: false,
      reviewed_by: 0,
      words: 4,
      custom_translation_statuses: []
    }
  ],
  is_plural: false,
  plural_name: "",
  is_hidden: false,
  is_archived: false,
  context: "Shown when user first opens the app",
  base_words: 4,
  char_limit: 50,
  custom_attributes: {},
  modified_at: "2024-01-21 09:15:22 (Etc/UTC)",
  modified_at_timestamp: 1705829722
};

// Cursor pagination fixture
export const keysCursorPaginationFixture = {
  items: [keyFixture],
  totalResults: 0, // Not provided in cursor pagination
  totalPages: 0,
  resultsPerPage: 100,
  currentPage: 0,
  nextCursor: "eyIxIjo0NDU5NjA2MX0=",
  hasNextCursor: () => true,
  responseTooBig: false
};

// Bulk operation fixtures
export const bulkCreateKeysFixture = {
  items: [
    createKeyFixture({ key_name: { web: "created.key.1" } }),
    createKeyFixture({ key_name: { web: "created.key.2" } })
  ],
  errors: [
    {
      key_name: "duplicate.key",
      error: { message: "Key already exists" }
    }
  ]
};
```

### 2. Languages Domain Fixtures

```typescript
// src/domains/languages/__fixtures__/languages.fixtures.ts
import type { Language, SystemLanguage } from "@lokalise/node-api";

export const languageFixture: Language = {
  lang_id: 640,
  lang_iso: "en",
  lang_name: "English",
  is_rtl: false,
  plural_forms: ["zero", "one", "other"],
  is_base: true,
  progress: 100,
  words_to_do: 0
};

export const systemLanguageFixture: SystemLanguage = {
  lang_id: 640,
  lang_iso: "en",
  lang_name: "English",
  is_rtl: false,
  plural_forms: ["zero", "one", "other"]
};

export const languagesListFixture = [
  languageFixture,
  createLanguageFixture({
    lang_id: 673,
    lang_iso: "fr",
    lang_name: "French",
    is_base: false,
    progress: 75,
    words_to_do: 392
  }),
  createLanguageFixture({
    lang_id: 597,
    lang_iso: "ru",
    lang_name: "Russian",
    is_base: false,
    progress: 45,
    words_to_do: 862,
    plural_forms: ["one", "few", "many", "other"]
  })
];
```

### 3. Tasks Domain Fixtures

```typescript
// src/domains/tasks/__fixtures__/tasks.fixtures.ts
import type { Task } from "@lokalise/node-api";

export const taskFixture: Task = {
  task_id: 123456,
  title: "Translate marketing copy",
  description: "Translate all marketing related keys to French",
  status: "in_progress",
  progress: 45,
  due_date: "2024-02-01 00:00:00 (Etc/UTC)",
  due_date_timestamp: 1706745600,
  keys_count: 150,
  words_count: 2340,
  created_at: "2024-01-15 10:00:00 (Etc/UTC)",
  created_at_timestamp: 1705314000,
  created_by: 20181,
  created_by_email: "manager@example.com",
  languages: [
    {
      language_iso: "fr",
      users: [
        {
          user_id: 20182,
          email: "translator@example.com",
          fullname: "Jane Translator"
        }
      ]
    }
  ],
  source_language_iso: "en",
  auto_close_languages: true,
  auto_close_task: true,
  auto_close_items: true,
  completed_at: null,
  completed_at_timestamp: 0,
  completed_by: 0,
  completed_by_email: "",
  do_lock_translations: false,
  custom_translation_status_ids: []
};
```

### 4. Comments Domain Fixtures

```typescript
// src/domains/comments/__fixtures__/comments.fixtures.ts
import type { Comment } from "@lokalise/node-api";

export const commentFixture: Comment = {
  comment_id: 789012,
  key_id: 15519786,
  comment: "Please keep this translation concise",
  added_by: 20181,
  added_by_email: "reviewer@example.com",
  added_at: "2024-01-22 16:45:00 (Etc/UTC)",
  added_at_timestamp: 1705939500
};
```

### 5. Translations Domain Fixtures

```typescript
// src/domains/translations/__fixtures__/translations.fixtures.ts
import type { Translation } from "@lokalise/node-api";

export const translationFixture: Translation = {
  translation_id: 444921322,
  key_id: 15519786,
  language_iso: "en",
  modified_at: "2024-01-20 14:22:33 (Etc/UTC)",
  modified_at_timestamp: 1705761753,
  modified_by: 20181,
  modified_by_email: "test@example.com",
  translation: "Welcome to Our App",
  is_unverified: false,
  is_reviewed: true,
  reviewed_by: 20181,
  words: 4,
  custom_translation_statuses: [],
  task_id: null
};

// Cursor pagination for translations
export const translationsCursorFixture = {
  items: [translationFixture],
  totalResults: 0,
  totalPages: 0,
  resultsPerPage: 100,
  currentPage: 0,
  nextCursor: "eyIxIjoxMjM0NTY3OH0=",
  hasNextCursor: () => true
};
```

## Error Response Fixtures

```typescript
// src/test-utils/fixtures/errors/error.fixtures.ts
export const errorFixtures = {
  unauthorized: {
    error: {
      message: "Invalid API token",
      code: 401
    }
  },
  forbidden: {
    error: {
      message: "You do not have permission to access this resource",
      code: 403
    }
  },
  notFound: {
    error: {
      message: "Resource not found",
      code: 404
    }
  },
  rateLimited: {
    error: {
      message: "Too many requests",
      code: 429
    },
    headers: {
      "x-rate-limit-limit": "6000",
      "x-rate-limit-remaining": "0",
      "x-rate-limit-reset": "1705940000"
    }
  },
  validationError: {
    error: {
      message: "Validation failed",
      code: 400,
      errors: [
        {
          field: "name",
          message: "Name is required"
        },
        {
          field: "base_language_iso",
          message: "Invalid language code"
        }
      ]
    }
  },
  serverError: {
    error: {
      message: "Internal server error",
      code: 500
    }
  }
};

export function createErrorResponse(
  code: number,
  message: string,
  details?: any
): Error {
  const error = new Error(message);
  (error as any).response = {
    status: code,
    data: {
      error: {
        message,
        code,
        ...details
      }
    }
  };
  return error;
}
```

## Pagination Fixtures

```typescript
// src/test-utils/fixtures/pagination/pagination.fixtures.ts

// Standard pagination headers
export const paginationHeaders = {
  standard: {
    "x-pagination-total-count": "150",
    "x-pagination-page": "1",
    "x-pagination-limit": "100",
    "x-pagination-page-count": "2"
  },
  lastPage: {
    "x-pagination-total-count": "150",
    "x-pagination-page": "2",
    "x-pagination-limit": "100",
    "x-pagination-page-count": "2"
  },
  empty: {
    "x-pagination-total-count": "0",
    "x-pagination-page": "1",
    "x-pagination-limit": "100",
    "x-pagination-page-count": "0"
  }
};

// Cursor pagination headers
export const cursorPaginationHeaders = {
  hasMore: {
    "x-pagination-limit": "100",
    "x-pagination-next-cursor": "eyIxIjo0NDU5NjA2MX0="
  },
  lastPage: {
    "x-pagination-limit": "100",
    "x-pagination-next-cursor": null
  },
  responseTooBig: {
    "x-pagination-limit": "100",
    "x-pagination-next-cursor": "eyIxIjo0NDU5NjA2MX0=",
    "x-response-too-big": ""
  }
};
```

## Fixture Utilities

```typescript
// src/test-utils/fixture-helpers/builders.ts

export class FixtureBuilder<T> {
  protected entity: Partial<T> = {};

  constructor(private defaults: T) {
    this.entity = { ...defaults };
  }

  with(overrides: Partial<T>): this {
    this.entity = { ...this.entity, ...overrides };
    return this;
  }

  build(): T {
    return this.entity as T;
  }

  buildMany(count: number, modifier?: (item: T, index: number) => T): T[] {
    return Array.from({ length: count }, (_, i) => {
      const item = this.build();
      return modifier ? modifier(item, i) : item;
    });
  }
}

// Usage example
export class ProjectFixtureBuilder extends FixtureBuilder<Project> {
  constructor() {
    super(projectFixture);
  }

  withLanguages(languages: string[]): this {
    // Add language statistics
    return this;
  }

  withProgress(progress: number): this {
    this.entity.statistics = {
      ...this.entity.statistics,
      progress_total: progress
    };
    return this;
  }
}
```

## Fixture Data Generators

```typescript
// src/test-utils/fixture-helpers/generators.ts

export const generators = {
  // Generate realistic project names
  projectName: (index: number) => {
    const names = [
      "Mobile App", "Web Platform", "Documentation",
      "Marketing Site", "Admin Dashboard", "API Docs",
      "Customer Portal", "Landing Page", "Email Templates"
    ];
    return names[index % names.length];
  },

  // Generate key names by platform
  keyName: (base: string, platform: string) => {
    const formats = {
      ios: base.replace(/\./g, "_").toUpperCase(),
      android: base.replace(/\./g, "_").toLowerCase(),
      web: base.toUpperCase().replace(/\./g, "_"),
      other: base
    };
    return formats[platform] || base;
  },

  // Generate realistic translation content
  translation: (key: string, language: string) => {
    const translations = {
      en: {
        "app.title": "Application Title",
        "welcome.message": "Welcome to our application",
        "button.submit": "Submit",
        "button.cancel": "Cancel"
      },
      fr: {
        "app.title": "Titre de l'application",
        "welcome.message": "Bienvenue dans notre application",
        "button.submit": "Soumettre",
        "button.cancel": "Annuler"
      },
      de: {
        "app.title": "Anwendungstitel",
        "welcome.message": "Willkommen in unserer Anwendung",
        "button.submit": "Einreichen",
        "button.cancel": "Abbrechen"
      }
    };
    return translations[language]?.[key] || `${key} (${language})`;
  },

  // Generate timestamps
  timestamp: (daysAgo: number = 0) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return {
      timestamp: Math.floor(date.getTime() / 1000),
      formatted: date.toISOString().replace("T", " ").split(".")[0] + " (Etc/UTC)"
    };
  }
};
```

## Usage Guidelines

### 1. Import Fixtures

```typescript
import { 
  createProjectFixture,
  createProjectsListFixture 
} from "./__fixtures__/projects.fixtures";
```

### 2. Override Defaults

```typescript
const customProject = createProjectFixture({
  name: "Custom Project",
  statistics: {
    keys_total: 500
  }
});
```

### 3. Generate Collections

```typescript
const projects = createProjectsListFixture({
  count: 10,
  page: 2,
  limit: 5
});
```

### 4. Use Builders for Complex Scenarios

```typescript
const project = new ProjectFixtureBuilder()
  .withLanguages(["en", "fr", "de"])
  .withProgress(75)
  .build();
```

## Best Practices

1. **Keep Fixtures Realistic**: Use actual API response structures
2. **Maintain Type Safety**: Always type fixtures properly
3. **Use Factories**: Create factory functions for flexibility
4. **Avoid Duplication**: Share common fixtures across tests
5. **Document Fixtures**: Add comments explaining complex fixtures
6. **Version Fixtures**: Track changes when API updates

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-08-24  
**Related**: API_MOCKING_GUIDE.md, TEST_IMPLEMENTATION_GUIDE.md