import { performance } from "node:perf_hooks";

export interface PerformanceMetrics {
	duration: number;
	memoryUsed: number;
	memoryDelta: number;
	cpuUsage?: NodeJS.CpuUsage;
}

export interface BenchmarkResult {
	name: string;
	iterations: number;
	averageTime: number;
	minTime: number;
	maxTime: number;
	standardDeviation: number;
	operationsPerSecond: number;
	memoryUsed: number;
}

/**
 * Measure the performance of an async function
 */
export async function measurePerformance<T>(
	fn: () => Promise<T>,
	label?: string,
): Promise<{ result: T; metrics: PerformanceMetrics }> {
	const startMemory = process.memoryUsage().heapUsed;
	const startCpu = process.cpuUsage();
	const startTime = performance.now();

	const result = await fn();

	const endTime = performance.now();
	const endCpu = process.cpuUsage(startCpu);
	const endMemory = process.memoryUsage().heapUsed;

	const metrics: PerformanceMetrics = {
		duration: endTime - startTime,
		memoryUsed: endMemory,
		memoryDelta: endMemory - startMemory,
		cpuUsage: endCpu,
	};

	if (label) {
		console.log(`[Performance] ${label}:`, {
			duration: `${metrics.duration.toFixed(2)}ms`,
			memory: `${(metrics.memoryDelta / 1024 / 1024).toFixed(2)}MB`,
		});
	}

	return { result, metrics };
}

/**
 * Benchmark a function with multiple iterations
 */
export async function benchmark(
	name: string,
	fn: () => Promise<unknown>,
	iterations = 100,
): Promise<BenchmarkResult> {
	const times: number[] = [];
	const memoryStart = process.memoryUsage().heapUsed;

	// Warmup run
	await fn();

	for (let i = 0; i < iterations; i++) {
		const start = performance.now();
		await fn();
		const end = performance.now();
		times.push(end - start);
	}

	const memoryEnd = process.memoryUsage().heapUsed;
	const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
	const minTime = Math.min(...times);
	const maxTime = Math.max(...times);

	// Calculate standard deviation
	const variance =
		times.reduce((sum, time) => sum + (time - averageTime) ** 2, 0) /
		times.length;
	const standardDeviation = Math.sqrt(variance);

	return {
		name,
		iterations,
		averageTime,
		minTime,
		maxTime,
		standardDeviation,
		operationsPerSecond: 1000 / averageTime,
		memoryUsed: memoryEnd - memoryStart,
	};
}

/**
 * Compare performance of multiple implementations
 */
export async function compareBenchmarks(
	benchmarks: Array<{ name: string; fn: () => Promise<unknown> }>,
	iterations = 100,
): Promise<void> {
	console.log(`\nRunning benchmarks with ${iterations} iterations each...\n`);

	const results: BenchmarkResult[] = [];

	for (const { name, fn } of benchmarks) {
		const result = await benchmark(name, fn, iterations);
		results.push(result);
	}

	// Sort by average time (fastest first)
	results.sort((a, b) => a.averageTime - b.averageTime);

	// Display results
	console.table(
		results.map((r, index) => ({
			rank: index + 1,
			name: r.name,
			avgTime: `${r.averageTime.toFixed(2)}ms`,
			ops: `${r.operationsPerSecond.toFixed(0)}/s`,
			min: `${r.minTime.toFixed(2)}ms`,
			max: `${r.maxTime.toFixed(2)}ms`,
			stdDev: `${r.standardDeviation.toFixed(2)}ms`,
			memory: `${(r.memoryUsed / 1024 / 1024).toFixed(2)}MB`,
		})),
	);

	// Show relative performance
	const fastest = results[0];
	console.log("\nRelative Performance:");
	for (const result of results) {
		const ratio = result.averageTime / fastest.averageTime;
		const comparison =
			ratio === 1 ? "🏆 Fastest" : `${ratio.toFixed(2)}x slower`;
		console.log(`  ${result.name}: ${comparison}`);
	}
}

/**
 * Monitor memory usage during test execution
 */
export class MemoryMonitor {
	private initialMemory: number;
	private peakMemory: number;
	private samples: number[] = [];
	private interval: NodeJS.Timeout | null = null;

	constructor(private sampleInterval = 100) {
		this.initialMemory = process.memoryUsage().heapUsed;
		this.peakMemory = this.initialMemory;
	}

	start(): void {
		this.interval = setInterval(() => {
			const current = process.memoryUsage().heapUsed;
			this.samples.push(current);
			if (current > this.peakMemory) {
				this.peakMemory = current;
			}
		}, this.sampleInterval);
	}

	stop(): void {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}
	}

	getReport() {
		const currentMemory = process.memoryUsage().heapUsed;
		const averageMemory =
			this.samples.reduce((a, b) => a + b, 0) / (this.samples.length || 1);

		return {
			initial: this.initialMemory,
			current: currentMemory,
			peak: this.peakMemory,
			average: averageMemory,
			delta: currentMemory - this.initialMemory,
			peakDelta: this.peakMemory - this.initialMemory,
			samples: this.samples.length,
			formatted: {
				initial: `${(this.initialMemory / 1024 / 1024).toFixed(2)}MB`,
				current: `${(currentMemory / 1024 / 1024).toFixed(2)}MB`,
				peak: `${(this.peakMemory / 1024 / 1024).toFixed(2)}MB`,
				average: `${(averageMemory / 1024 / 1024).toFixed(2)}MB`,
				delta: `${((currentMemory - this.initialMemory) / 1024 / 1024).toFixed(
					2,
				)}MB`,
				peakDelta: `${(
					(this.peakMemory - this.initialMemory) / 1024 / 1024
				).toFixed(2)}MB`,
			},
		};
	}
}

/**
 * Rate limiter simulator for testing
 */
export class RateLimiterSimulator {
	private requestCount = 0;
	private windowStart = Date.now();
	private readonly windowMs: number;
	private readonly maxRequests: number;

	constructor(maxRequests = 6000, windowMs = 3600000) {
		this.maxRequests = maxRequests;
		this.windowMs = windowMs;
	}

	async checkLimit(): Promise<{
		allowed: boolean;
		remaining: number;
		resetIn: number;
	}> {
		const now = Date.now();
		const windowElapsed = now - this.windowStart;

		// Reset window if expired
		if (windowElapsed >= this.windowMs) {
			this.requestCount = 0;
			this.windowStart = now;
		}

		const allowed = this.requestCount < this.maxRequests;
		if (allowed) {
			this.requestCount++;
		}

		return {
			allowed,
			remaining: Math.max(0, this.maxRequests - this.requestCount),
			resetIn: this.windowMs - windowElapsed,
		};
	}

	reset(): void {
		this.requestCount = 0;
		this.windowStart = Date.now();
	}

	getStatus() {
		return {
			requests: this.requestCount,
			limit: this.maxRequests,
			remaining: Math.max(0, this.maxRequests - this.requestCount),
			resetAt: new Date(this.windowStart + this.windowMs),
		};
	}
}

/**
 * Helper to test performance requirements
 */
export function assertPerformance(
	metrics: PerformanceMetrics,
	requirements: {
		maxDuration?: number;
		maxMemoryDelta?: number;
	},
): void {
	if (
		requirements.maxDuration !== undefined &&
		metrics.duration > requirements.maxDuration
	) {
		throw new Error(
			`Performance requirement failed: Duration ${metrics.duration.toFixed(
				2,
			)}ms exceeds maximum ${requirements.maxDuration}ms`,
		);
	}

	if (
		requirements.maxMemoryDelta !== undefined &&
		metrics.memoryDelta > requirements.maxMemoryDelta
	) {
		throw new Error(
			`Performance requirement failed: Memory delta ${(
				metrics.memoryDelta / 1024 / 1024
			).toFixed(2)}MB exceeds maximum ${(
				requirements.maxMemoryDelta / 1024 / 1024
			).toFixed(2)}MB`,
		);
	}
}

/**
 * Test helper for bulk operations
 */
export async function testBulkPerformance(
	operation: (items: unknown[]) => Promise<unknown>,
	sizes: number[] = [10, 100, 1000],
	generateItem: (index: number) => unknown = (i) => ({ id: i }),
): Promise<void> {
	console.log("\n=== Bulk Operation Performance Test ===\n");

	for (const size of sizes) {
		const items = Array.from({ length: size }, (_, i) => generateItem(i));
		const monitor = new MemoryMonitor();

		monitor.start();
		const { metrics } = await measurePerformance(
			() => operation(items),
			`Processing ${size} items`,
		);
		monitor.stop();

		const memoryReport = monitor.getReport();

		console.log(`\nSize: ${size} items`);
		console.log(`  Time: ${metrics.duration.toFixed(2)}ms`);
		console.log(
			`  Rate: ${(size / (metrics.duration / 1000)).toFixed(0)} items/sec`,
		);
		console.log(`  Memory Peak: ${memoryReport.formatted.peak}`);
		console.log(`  Memory Delta: ${memoryReport.formatted.peakDelta}`);

		// Assert reasonable performance
		const maxTimePerItem = 30; // 30ms per item max
		const maxMemoryPerItem = 100 * 1024; // 100KB per item max

		assertPerformance(metrics, {
			maxDuration: size * maxTimePerItem,
			maxMemoryDelta: size * maxMemoryPerItem,
		});
	}
}

export default {
	measurePerformance,
	benchmark,
	compareBenchmarks,
	MemoryMonitor,
	RateLimiterSimulator,
	assertPerformance,
	testBulkPerformance,
};
