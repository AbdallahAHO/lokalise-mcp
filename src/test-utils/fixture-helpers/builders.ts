export class FixtureBuilder<T> {
	protected entity: Partial<T> = {};

	constructor(defaults: T) {
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

// Base class for domain-specific builders
export abstract class DomainFixtureBuilder<T> extends FixtureBuilder<T> {
	protected abstract getDefaultEntity(): T;

	constructor() {
		super({} as T);
		this.entity = this.getDefaultEntity();
	}

	// Helper to merge nested objects
	protected mergeNested<K extends keyof T>(key: K, value: Partial<T[K]>): this {
		this.entity[key] = {
			...(typeof this.entity[key] === "object" && this.entity[key] !== null
				? this.entity[key]
				: {}),
			...value,
		} as T[K];
		return this;
	}
}
