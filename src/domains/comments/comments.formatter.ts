import type {
	Comment,
	CommentDeleted,
	PaginatedResult,
} from "@lokalise/node-api";
import {
	formatBulletList,
	formatDate,
	formatEmptyState,
	formatFooter,
	formatHeading,
	formatTable,
} from "../../shared/utils/formatter.util.js";

/**
 * Comments formatter functions for converting API responses to user-friendly Markdown.
 * Comments are attached to translation keys and allow team collaboration.
 */

/**
 * Format a list of comments for a specific key into Markdown.
 * @param commentsData - API response containing comments list
 * @param keyId - The key ID for context
 * @returns Formatted Markdown string
 */
export function formatKeyCommentsList(
	commentsData: PaginatedResult<Comment>,
	keyId: number,
): string {
	const lines: string[] = [];

	// Add main heading
	const totalCount =
		commentsData.totalResults || commentsData.items?.length || 0;
	lines.push(formatHeading(`Comments for Key #${keyId} (${totalCount})`, 1));
	lines.push("");

	if (!commentsData.items || commentsData.items.length === 0) {
		const suggestions = [
			"Add a comment to start the discussion",
			"Comments help collaborate on translation decisions",
			"Use comments to provide context for translators",
		];
		lines.push(formatEmptyState("comments", `key #${keyId}`, suggestions));
		lines.push(formatFooter("No comments found"));
		return lines.join("\n");
	}

	// Add summary section
	lines.push(formatHeading("Summary", 2));
	const summary: Record<string, unknown> = {
		"Total Comments": totalCount,
		"Current Page": commentsData.currentPage || 1,
		"Total Pages": commentsData.totalPages || 1,
		"Results Per Page":
			commentsData.resultsPerPage || commentsData.items.length,
	};
	lines.push(formatBulletList(summary));
	lines.push("");

	// Add comments table
	lines.push(formatHeading("Comments", 2));

	const tableData = commentsData.items.map((comment: Comment) => ({
		id: comment.comment_id,
		author: comment.added_by_email || `User #${comment.added_by}`,
		comment:
			comment.comment.length > 50
				? `${comment.comment.substring(0, 50)}...`
				: comment.comment,
		added: formatDate(new Date(comment.added_at_timestamp * 1000)),
	}));

	const table = formatTable(tableData, [
		{ key: "id", header: "ID" },
		{ key: "author", header: "Author" },
		{ key: "comment", header: "Comment" },
		{ key: "added", header: "Added" },
	]);

	lines.push(table);
	lines.push("");

	// Add pagination info if applicable
	if (commentsData.totalPages > 1) {
		lines.push(formatHeading("Pagination", 2));
		lines.push(
			`Page ${commentsData.currentPage} of ${commentsData.totalPages}`,
		);
		if (commentsData.currentPage < commentsData.totalPages) {
			lines.push(`- Next page: ${commentsData.currentPage + 1}`);
		}
		if (commentsData.currentPage > 1) {
			lines.push(`- Previous page: ${commentsData.currentPage - 1}`);
		}
		lines.push("");
	}

	// Add footer
	lines.push(formatFooter("Comments retrieved"));

	return lines.join("\n");
}

/**
 * Format all project comments into Markdown.
 * @param commentsData - API response containing all project comments
 * @returns Formatted Markdown string
 */
export function formatProjectCommentsList(
	commentsData: PaginatedResult<Comment>,
): string {
	const lines: string[] = [];

	// Add main heading
	const totalCount =
		commentsData.totalResults || commentsData.items?.length || 0;
	lines.push(formatHeading(`All Project Comments (${totalCount})`, 1));
	lines.push("");

	if (!commentsData.items || commentsData.items.length === 0) {
		const suggestions = [
			"Start adding comments to translation keys",
			"Comments help track translation decisions",
			"Use comments for team collaboration",
		];
		lines.push(formatEmptyState("comments", "this project", suggestions));
		lines.push(formatFooter("No comments found"));
		return lines.join("\n");
	}

	// Add summary section
	lines.push(formatHeading("Summary", 2));
	const summary: Record<string, unknown> = {
		"Total Comments": totalCount,
		"Current Page": commentsData.currentPage || 1,
		"Total Pages": commentsData.totalPages || 1,
		"Results Per Page":
			commentsData.resultsPerPage || commentsData.items.length,
	};
	lines.push(formatBulletList(summary));
	lines.push("");

	// Group comments by key
	const commentsByKey = new Map<number, Comment[]>();
	for (const comment of commentsData.items) {
		const keyComments = commentsByKey.get(comment.key_id) || [];
		keyComments.push(comment);
		commentsByKey.set(comment.key_id, keyComments);
	}

	// Add comments grouped by key
	lines.push(formatHeading("Comments by Key", 2));

	for (const [keyId, comments] of commentsByKey) {
		lines.push(
			`### Key #${keyId} (${comments.length} comment${comments.length !== 1 ? "s" : ""})`,
		);

		const tableData = comments.map((comment: Comment) => ({
			id: comment.comment_id,
			author: comment.added_by_email || `User #${comment.added_by}`,
			comment:
				comment.comment.length > 40
					? `${comment.comment.substring(0, 40)}...`
					: comment.comment,
			added: formatDate(new Date(comment.added_at_timestamp * 1000)),
		}));

		const table = formatTable(tableData, [
			{ key: "id", header: "ID" },
			{ key: "author", header: "Author" },
			{ key: "comment", header: "Comment" },
			{ key: "added", header: "Added" },
		]);

		lines.push(table);
		lines.push("");
	}

	// Add pagination info if applicable
	if (commentsData.totalPages > 1) {
		lines.push(formatHeading("Pagination", 2));
		lines.push(
			`Page ${commentsData.currentPage} of ${commentsData.totalPages}`,
		);
		if (commentsData.currentPage < commentsData.totalPages) {
			lines.push(`- Next page: ${commentsData.currentPage + 1}`);
		}
		if (commentsData.currentPage > 1) {
			lines.push(`- Previous page: ${commentsData.currentPage - 1}`);
		}
		lines.push("");
	}

	// Add footer
	lines.push(formatFooter("All comments retrieved"));

	return lines.join("\n");
}

/**
 * Format comment details into Markdown.
 * @param comment - Comment data from API
 * @returns Formatted Markdown string
 */
export function formatCommentDetails(comment: Comment): string {
	const lines: string[] = [];

	// Add main heading
	lines.push(formatHeading(`Comment #${comment.comment_id}`, 1));
	lines.push("");

	// Add comment content
	lines.push(formatHeading("Comment", 2));
	lines.push("```");
	lines.push(comment.comment);
	lines.push("```");
	lines.push("");

	// Add metadata
	lines.push(formatHeading("Details", 2));
	const details: Record<string, unknown> = {
		"Comment ID": comment.comment_id,
		"Key ID": comment.key_id,
		Author: comment.added_by_email || `User #${comment.added_by}`,
		"Author ID": comment.added_by,
		Added: formatDate(new Date(comment.added_at_timestamp * 1000)),
		Timestamp: comment.added_at_timestamp,
	};
	lines.push(formatBulletList(details));
	lines.push("");

	// Add footer
	lines.push(formatFooter("Comment retrieved"));

	return lines.join("\n");
}

/**
 * Format comments creation result into Markdown.
 * @param comments - The created comments data
 * @param keyId - The key ID for context
 * @returns Formatted Markdown string
 */
export function formatCreateCommentsResult(
	comments: Comment[],
	keyId: number,
): string {
	const lines: string[] = [];

	// Add main heading
	const count = comments.length;
	lines.push(
		formatHeading(
			`${count} Comment${count !== 1 ? "s" : ""} Created Successfully`,
			1,
		),
	);
	lines.push("");

	// Add creation summary
	lines.push(formatHeading("Creation Summary", 2));
	const summary: Record<string, unknown> = {
		"Key ID": keyId,
		"Comments Created": count,
		"Created At": formatDate(new Date()),
	};
	lines.push(formatBulletList(summary));
	lines.push("");

	// Add created comments details
	lines.push(formatHeading("Created Comments", 2));

	const tableData = comments.map((comment: Comment) => ({
		id: comment.comment_id,
		author: comment.added_by_email || `User #${comment.added_by}`,
		comment:
			comment.comment.length > 50
				? `${comment.comment.substring(0, 50)}...`
				: comment.comment,
		added: formatDate(new Date(comment.added_at_timestamp * 1000)),
	}));

	const table = formatTable(tableData, [
		{ key: "id", header: "ID" },
		{ key: "author", header: "Author" },
		{ key: "comment", header: "Comment" },
		{ key: "added", header: "Added" },
	]);

	lines.push(table);
	lines.push("");

	// Add next steps
	lines.push(formatHeading("Next Steps", 2));
	const nextSteps = [
		"View the comments in the Lokalise dashboard",
		"Add replies or additional comments as needed",
		"Use comments to guide translation decisions",
	];
	for (const step of nextSteps) {
		lines.push(`- ${step}`);
	}
	lines.push("");

	// Add footer
	lines.push(formatFooter("Comments created"));

	return lines.join("\n");
}

/**
 * Format comment deletion result into Markdown.
 * @param result - The deletion result from API
 * @returns Formatted Markdown string
 */
export function formatDeleteCommentResult(result: CommentDeleted): string {
	const lines: string[] = [];

	// Add main heading
	lines.push(formatHeading("Comment Deleted Successfully", 1));
	lines.push("");

	// Add deletion details
	lines.push(formatHeading("Deletion Details", 2));
	const details: Record<string, unknown> = {
		"Project ID": result.project_id,
		"Deletion Status": result.comment_deleted ? "Success" : "Failed",
		"Deletion Time": formatDate(new Date()),
	};

	if (result.branch) {
		details.Branch = result.branch;
	}

	lines.push(formatBulletList(details));
	lines.push("");

	// Add warning
	lines.push(formatHeading("⚠️ Important", 2));
	lines.push("- This action cannot be undone");
	lines.push("- The comment has been permanently removed");
	lines.push("- Other comments on the same key remain unaffected");
	lines.push("");

	// Add footer
	lines.push(formatFooter("Comment deleted"));

	return lines.join("\n");
}
