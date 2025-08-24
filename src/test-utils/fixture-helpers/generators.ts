export const generators = {
	// Generate realistic project names
	projectName: (index: number) => {
		const names = [
			"Mobile App",
			"Web Platform",
			"Documentation",
			"Marketing Site",
			"Admin Dashboard",
			"API Docs",
			"Customer Portal",
			"Landing Page",
			"Email Templates",
		];
		return names[index % names.length];
	},

	// Generate key names by platform
	keyName: (base: string, platform: string) => {
		const formats: Record<string, string> = {
			ios: base.replace(/\./g, "_").toUpperCase(),
			android: base.replace(/\./g, "_").toLowerCase(),
			web: base.toUpperCase().replace(/\./g, "_"),
			other: base,
		};
		return formats[platform] || base;
	},

	// Generate realistic translation content
	translation: (key: string, language: string) => {
		const translations: Record<string, Record<string, string>> = {
			en: {
				"app.title": "Application Title",
				"welcome.message": "Welcome to our application",
				"button.submit": "Submit",
				"button.cancel": "Cancel",
				"error.network": "Network error occurred",
				"success.saved": "Successfully saved",
			},
			fr: {
				"app.title": "Titre de l'application",
				"welcome.message": "Bienvenue dans notre application",
				"button.submit": "Soumettre",
				"button.cancel": "Annuler",
				"error.network": "Erreur réseau survenue",
				"success.saved": "Enregistré avec succès",
			},
			de: {
				"app.title": "Anwendungstitel",
				"welcome.message": "Willkommen in unserer Anwendung",
				"button.submit": "Einreichen",
				"button.cancel": "Abbrechen",
				"error.network": "Netzwerkfehler aufgetreten",
				"success.saved": "Erfolgreich gespeichert",
			},
			es: {
				"app.title": "Título de la aplicación",
				"welcome.message": "Bienvenido a nuestra aplicación",
				"button.submit": "Enviar",
				"button.cancel": "Cancelar",
				"error.network": "Error de red ocurrido",
				"success.saved": "Guardado exitosamente",
			},
		};
		return translations[language]?.[key] || `${key} (${language})`;
	},

	// Generate timestamps
	timestamp: (daysAgo = 0) => {
		const date = new Date();
		date.setDate(date.getDate() - daysAgo);
		return {
			timestamp: Math.floor(date.getTime() / 1000),
			formatted: `${date.toISOString().replace("T", " ").split(".")[0]} (Etc/UTC)`,
		};
	},

	// Generate random IDs
	id: {
		project: (index: number) =>
			`${Math.random().toString(36).substring(2, 15)}${index}.${Math.random()
				.toString(36)
				.substring(2, 10)}`,
		key: (index: number) => 1000000 + index,
		task: (index: number) => 100000 + index,
		comment: (index: number) => 10000 + index,
		translation: (index: number) => 400000000 + index,
		contributor: (index: number) => 20000 + index,
	},

	// Generate email addresses
	email: (role: string, index: number) => {
		const domains = ["example.com", "test.com", "lokalise.test"];
		const prefixes: Record<string, string[]> = {
			admin: ["admin", "manager", "owner"],
			translator: ["translator", "linguist", "localizer"],
			reviewer: ["reviewer", "proofreader", "editor"],
			developer: ["dev", "developer", "engineer"],
		};
		const prefix = prefixes[role]?.[index % 3] || role;
		const domain = domains[index % domains.length];
		return `${prefix}${index > 0 ? index : ""}@${domain}`;
	},

	// Generate language codes
	languageCode: (index: number) => {
		const codes = ["en", "fr", "de", "es", "it", "pt", "ru", "ja", "zh", "ko"];
		return codes[index % codes.length];
	},

	// Generate language names
	languageName: (code: string) => {
		const names: Record<string, string> = {
			en: "English",
			fr: "French",
			de: "German",
			es: "Spanish",
			it: "Italian",
			pt: "Portuguese",
			ru: "Russian",
			ja: "Japanese",
			zh: "Chinese",
			ko: "Korean",
		};
		return names[code] || "Unknown Language";
	},

	// Generate file names by platform
	fileName: (platform: string) => {
		const files: Record<string, string> = {
			ios: "Localizable.strings",
			android: "strings.xml",
			web: "en.json",
			other: "translations.yml",
		};
		return files[platform] || "translations.json";
	},

	// Generate random progress percentage
	progress: () => Math.floor(Math.random() * 101),

	// Generate random word count
	wordCount: () => Math.floor(Math.random() * 1000) + 1,

	// Generate tags
	tags: (count: number) => {
		const allTags = [
			"ui",
			"backend",
			"api",
			"error",
			"success",
			"onboarding",
			"settings",
			"profile",
			"payment",
			"notification",
		];
		return allTags.slice(0, count);
	},

	// Generate platforms
	platforms: (count: number) => {
		const allPlatforms = ["ios", "android", "web", "other"];
		return allPlatforms.slice(0, count);
	},

	// User generators
	user: {
		id: () => 10000 + Math.floor(Math.random() * 90000),
		email: () => `user${Math.floor(Math.random() * 1000)}@example.com`,
	},

	// Key generators
	key: {
		id: () => 10000000 + Math.floor(Math.random() * 90000000),
		name: () => `key.${Math.random().toString(36).substring(7)}`,
	},

	// Task generators
	task: {
		id: () => 1000000 + Math.floor(Math.random() * 9000000),
		title: () => `Translation Task ${Math.floor(Math.random() * 1000)}`,
		description: () =>
			`Description for task ${Math.floor(Math.random() * 1000)}`,
	},
};
