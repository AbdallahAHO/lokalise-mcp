import type {
	DownloadedFileProcessDetails,
	PaginatedResult,
	QueuedProcess,
	QueuedProcessDetails,
	UploadedFileProcessDetails,
} from "@lokalise/node-api";
import { z } from "zod";

/**
 * Queued Processes domain type definitions and Zod schemas.
 * Fully compliant with Lokalise Node.js SDK v9.0.0+
 *
 * Handles monitoring of background/async operations including:
 * - File uploads
 * - File downloads/exports
 * - Project imports/exports
 * - Bulk operations
 */

// ============================================================================
// SDK Type Re-exports
// ============================================================================

// Re-export SDK types for convenience and type safety
export type {
	QueuedProcess,
	QueuedProcessDetails,
	PaginatedResult,
	UploadedFileProcessDetails,
	DownloadedFileProcessDetails,
};

// ============================================================================
// Process Status Types
// ============================================================================

/**
 * Valid process status values from the SDK
 */
export const ProcessStatus = {
	QUEUED: "queued" as const,
	PROCESSING: "processing" as const,
	FINISHED: "finished" as const,
	FAILED: "failed" as const,
	CANCELLED: "cancelled" as const,
} as const;

export type ProcessStatusType =
	(typeof ProcessStatus)[keyof typeof ProcessStatus];

/**
 * Valid process type values from the SDK
 */
export const ProcessType = {
	FILE_UPLOAD: "file-upload" as const,
	FILE_DOWNLOAD: "file-download" as const,
	PROJECT_EXPORT: "project-export" as const,
	PROJECT_IMPORT: "project-import" as const,
} as const;

export type ProcessTypeValue = (typeof ProcessType)[keyof typeof ProcessType];

// ============================================================================
// Process Details Types
// ============================================================================

// Note: Using SDK types directly - UploadedFileProcessDetails and DownloadedFileProcessDetails
// These are imported from @lokalise/node-api above

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Zod schema for the list queued processes tool arguments.
 * Validates input for listing background processes in a project.
 */
export const ListQueuedprocessesToolArgs = z
	.object({
		projectId: z
			.string()
			.min(1)
			.describe(
				"Project ID to list queued processes for (supports branch notation: projectId:branchName)",
			),
		limit: z
			.number()
			.int()
			.min(1)
			.max(100)
			.optional()
			.default(100)
			.describe("Number of processes to return (1-100, default: 100)"),
		page: z
			.number()
			.int()
			.positive()
			.optional()
			.default(1)
			.describe("Page number for pagination (default: 1)"),
	})
	.strict()
	.describe("Arguments for listing queued processes");

export type ListQueuedprocessesToolArgsType = z.infer<
	typeof ListQueuedprocessesToolArgs
>;

/**
 * Zod schema for the get queued process details tool arguments.
 * Validates input for retrieving specific process information.
 */
export const GetQueuedprocessesToolArgs = z
	.object({
		projectId: z.string().min(1).describe("Project ID containing the process"),
		processId: z
			.string()
			.min(1)
			.describe("Process ID to get details for (unique string identifier)"),
	})
	.strict()
	.describe("Arguments for getting queued process details");

export type GetQueuedprocessesToolArgsType = z.infer<
	typeof GetQueuedprocessesToolArgs
>;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if process details are for an upload
 */
export function isUploadProcessDetails(
	details: QueuedProcessDetails | undefined | Record<string, unknown>,
): details is UploadedFileProcessDetails {
	if (!details) return false;
	const obj = details as Record<string, unknown>;
	return "files" in obj && Array.isArray(obj.files);
}

/**
 * Type guard to check if process details are for a download
 */
export function isDownloadProcessDetails(
	details: QueuedProcessDetails | undefined | Record<string, unknown>,
): details is DownloadedFileProcessDetails {
	if (!details) return false;
	return (
		"download_url" in details &&
		"file_size_kb" in details &&
		"total_number_of_keys" in details
	);
}

/**
 * Type guard to check if a status is valid
 */
export function isValidProcessStatus(
	status: string,
): status is ProcessStatusType {
	return Object.values(ProcessStatus).includes(status as ProcessStatusType);
}

/**
 * Type guard to check if a type is valid
 */
export function isValidProcessType(type: string): type is ProcessTypeValue {
	return Object.values(ProcessType).includes(type as ProcessTypeValue);
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Response type for controller methods
 */
export interface QueuedProcessesControllerResponse {
	content: string;
	data?: QueuedProcess | PaginatedResult<QueuedProcess>;
	metadata?: {
		total?: number;
		page?: number;
		hasMore?: boolean;
		processType?: ProcessTypeValue;
		processStatus?: ProcessStatusType;
	};
}
