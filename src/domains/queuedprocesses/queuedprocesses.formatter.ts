/**
 * Queued Processes Formatter
 *
 * Handles formatting of Queued Process API responses into human-readable Markdown.
 * Provides rich, type-safe formatting with status indicators and process details.
 */

import type {
	DownloadedFileProcessDetails,
	PaginatedResult,
	QueuedProcess,
	UploadedFileProcessDetails,
} from "@lokalise/node-api";
import {
	isDownloadProcessDetails,
	isUploadProcessDetails,
	ProcessStatus,
	type ProcessStatusType,
} from "./queuedprocesses.types.js";

/**
 * Get emoji indicator for process status
 */
function getStatusEmoji(status: string): string {
	switch (status) {
		case ProcessStatus.QUEUED:
			return "⏳";
		case ProcessStatus.PROCESSING:
			return "⚙️";
		case ProcessStatus.FINISHED:
			return "✅";
		case ProcessStatus.FAILED:
			return "❌";
		case ProcessStatus.CANCELLED:
			return "🚫";
		default:
			return "❓";
	}
}

/**
 * Get human-readable process type description
 */
function getProcessTypeDescription(type: string): string {
	switch (type) {
		case "file-upload":
			return "File Upload";
		case "file-download":
			return "File Download/Export";
		case "project-export":
			return "Project Export";
		case "project-import":
			return "Project Import";
		default:
			return type;
	}
}

/**
 * Format a list of queued processes into Markdown
 */
export function formatQueuedprocessesList(
	result: PaginatedResult<QueuedProcess>,
	projectId: string,
): string {
	let content = `# Queued Processes (Project: ${projectId})\n\n`;
	content += `**Total Processes**: ${result.totalResults}\n`;
	content += `**Page**: ${result.currentPage} of ${result.totalPages}\n\n`;

	if (result.items.length === 0) {
		content += "*No queued processes found for this project.*\n";
		return content;
	}

	// Process list
	content += "## Active and Recent Processes\n\n";
	for (const process of result.items) {
		const statusEmoji = getStatusEmoji(process.status);
		const typeDesc = getProcessTypeDescription(process.type);

		content += `### ${statusEmoji} ${typeDesc} (${process.process_id})\n\n`;
		content += `- **Status**: ${process.status.toUpperCase()}\n`;
		content += `- **Type**: ${process.type}\n`;

		if (process.message) {
			content += `- **Message**: ${process.message}\n`;
		}

		content += `- **Created By**: ${process.created_by_email}\n`;
		content += `- **Created At**: ${new Date(process.created_at).toLocaleString()}\n`;
		content += `- **Timestamp**: ${process.created_at_timestamp}\n`;

		// Add summary based on details
		if (process.details) {
			content += formatProcessDetailsSummary(
				process.details as Record<string, unknown>,
			);
		}

		content += "\n---\n\n";
	}

	// Pagination info
	if (result.hasNextPage()) {
		content += `\n*More processes available. Use page ${result.nextPage()} to see more.*\n`;
	}

	return content;
}

/**
 * Format process details summary
 */
function formatProcessDetailsSummary(details: Record<string, unknown>): string {
	let summary = "";

	if (isUploadProcessDetails(details)) {
		const uploadDetails = details as unknown as UploadedFileProcessDetails;
		summary += "- **Upload Summary**:\n";
		if (uploadDetails.files && uploadDetails.files.length > 0) {
			summary += `  - Files Processed: ${uploadDetails.files.length}\n`;
			const totalKeys = uploadDetails.files.reduce(
				(sum, f) => sum + f.key_count_total,
				0,
			);
			const insertedKeys = uploadDetails.files.reduce(
				(sum, f) => sum + f.key_count_inserted,
				0,
			);
			const updatedKeys = uploadDetails.files.reduce(
				(sum, f) => sum + f.key_count_updated,
				0,
			);
			const totalWords = uploadDetails.files.reduce(
				(sum, f) => sum + f.word_count_total,
				0,
			);
			summary += `  - Total Keys: ${totalKeys}\n`;
			summary += `  - New Keys: ${insertedKeys}\n`;
			summary += `  - Updated Keys: ${updatedKeys}\n`;
			summary += `  - Total Words: ${totalWords}\n`;
		}
	} else if (isDownloadProcessDetails(details)) {
		const downloadDetails = details as unknown as DownloadedFileProcessDetails;
		summary += "- **Download Summary**:\n";
		summary += `  - File Size: ${downloadDetails.file_size_kb} KB\n`;
		summary += `  - Total Keys: ${downloadDetails.total_number_of_keys}\n`;
		if (downloadDetails.download_url) {
			summary += `  - [Download Link](${downloadDetails.download_url})\n`;
		}
	}

	return summary;
}

/**
 * Format queued process details into Markdown
 */
export function formatQueuedprocessesDetails(process: QueuedProcess): string {
	const statusEmoji = getStatusEmoji(process.status);
	const typeDesc = getProcessTypeDescription(process.type);

	let content = `# ${typeDesc} Process Details\n\n`;
	content += `## ${statusEmoji} Status: ${process.status.toUpperCase()}\n\n`;

	// Basic Information
	content += "## Process Information\n";
	content += `- **Process ID**: ${process.process_id}\n`;
	content += `- **Type**: ${process.type}\n`;
	content += `- **Status**: ${process.status}\n`;

	if (process.message) {
		content += `- **Message**: ${process.message}\n`;
	}

	content += "\n## Created By\n";
	content += `- **User ID**: ${process.created_by}\n`;
	content += `- **Email**: ${process.created_by_email}\n`;
	content += `- **Created**: ${new Date(process.created_at).toLocaleString()}\n`;
	content += `- **Timestamp**: ${process.created_at_timestamp}\n`;

	// Process details
	if (process.details && Object.keys(process.details).length > 0) {
		content += "\n## Process Details\n";
		content += formatProcessDetails(process.details as Record<string, unknown>);
	}

	// Status-specific information
	content += "\n## Status Information\n";
	content += getStatusInformation(process.status as ProcessStatusType);

	return content;
}

/**
 * Format detailed process information based on type
 */
function formatProcessDetails(details: Record<string, unknown>): string {
	let content = "";

	if (isUploadProcessDetails(details)) {
		const uploadDetails = details as unknown as UploadedFileProcessDetails;
		content += "### Upload Statistics\n";

		if (uploadDetails.files && uploadDetails.files.length > 0) {
			const totalWords = uploadDetails.files.reduce(
				(sum, f) => sum + f.word_count_total,
				0,
			);
			const totalKeys = uploadDetails.files.reduce(
				(sum, f) => sum + f.key_count_total,
				0,
			);
			const insertedKeys = uploadDetails.files.reduce(
				(sum, f) => sum + f.key_count_inserted,
				0,
			);
			const updatedKeys = uploadDetails.files.reduce(
				(sum, f) => sum + f.key_count_updated,
				0,
			);

			content += `- **Total Words**: ${totalWords.toLocaleString()}\n`;
			content += `- **Total Keys**: ${totalKeys}\n`;
			content += `- **New Keys Added**: ${insertedKeys}\n`;
			content += `- **Keys Updated**: ${updatedKeys}\n`;

			content += "\n### Files Processed\n";
			for (const file of uploadDetails.files) {
				content += `- **${file.name_original}**:\n`;
				content += `  - Status: ${file.status}\n`;
				if (file.message) {
					content += `  - Message: ${file.message}\n`;
				}
				content += `  - Words: ${file.word_count_total.toLocaleString()}\n`;
				content += `  - Keys: ${file.key_count_total} (${file.key_count_inserted} new, ${file.key_count_updated} updated, ${file.key_count_skipped} skipped)\n`;
			}
		}
	} else if (isDownloadProcessDetails(details)) {
		const downloadDetails = details as unknown as DownloadedFileProcessDetails;
		content += "### Download Information\n";
		content += `- **File Size**: ${(downloadDetails.file_size_kb / 1024).toFixed(2)} MB (${downloadDetails.file_size_kb} KB)\n`;
		content += `- **Total Keys**: ${downloadDetails.total_number_of_keys}\n`;

		if (downloadDetails.download_url) {
			content += `- **Download URL**: [Click here to download](${downloadDetails.download_url})\n`;
			content += "\n⚠️ *Note: Download links expire after a certain time.*\n";
		}
	} else {
		// Generic details formatting for unknown types
		content += "### Additional Details\n";
		for (const [key, value] of Object.entries(details)) {
			if (typeof value === "object" && value !== null) {
				content += `#### ${key}\n`;
				for (const [subKey, subValue] of Object.entries(
					value as Record<string, unknown>,
				)) {
					content += `- **${subKey}**: ${JSON.stringify(subValue)}\n`;
				}
			} else {
				content += `- **${key}**: ${value}\n`;
			}
		}
	}

	return content;
}

/**
 * Get status-specific information and recommendations
 */
function getStatusInformation(status: ProcessStatusType): string {
	switch (status) {
		case ProcessStatus.QUEUED:
			return "⏳ **Queued**: Process is waiting to be executed. This usually happens when there are other processes ahead in the queue.";
		case ProcessStatus.PROCESSING:
			return "⚙️ **Processing**: Process is currently being executed. Please wait for completion.";
		case ProcessStatus.FINISHED:
			return "✅ **Finished**: Process completed successfully. Check the details above for results.";
		case ProcessStatus.FAILED:
			return "❌ **Failed**: Process failed to complete. Check the message for error details. You may need to retry the operation.";
		case ProcessStatus.CANCELLED:
			return "🚫 **Cancelled**: Process was cancelled before completion. You can start a new process if needed.";
		default:
			return `❓ **Unknown Status**: ${status}`;
	}
}

/**
 * Format error message for queued processes
 */
export function formatQueuedprocessesError(error: Error): string {
	let content = "# ❌ Queued Process Error\n\n";
	content += `**Error**: ${error.message}\n\n`;
	content += "## Possible Solutions\n";
	content += "- Verify the project ID is correct\n";
	content += "- Check if the process ID exists\n";
	content += "- Ensure you have proper permissions\n";
	content += "- Try refreshing the process list\n";
	return content;
}
