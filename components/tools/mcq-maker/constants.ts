// ── Shared constants for the MCQ Maker ─────────────────────────────

/** Letter labels for answer options (A–F). */
export const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"] as const;

/** Maximum number of answer options per question. */
export const MAX_OPTIONS = 6;

/** Minimum number of answer options per question. */
export const MIN_OPTIONS = 2;

/** Maximum image file size in bytes (2 MB). */
export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

/** Maximum logo file size in bytes (1 MB). */
export const MAX_LOGO_SIZE_BYTES = 1 * 1024 * 1024;

/** Duration to show the save-success flash in milliseconds. */
export const SAVE_FLASH_MS = 1500;

/** Current schema version for persisted data. */
export const SCHEMA_VERSION = 1;
