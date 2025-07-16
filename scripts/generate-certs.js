#!/usr/bin/env node

/**
 * Generate certificates for DXT signing
 * Creates self-signed certificates for development or helps set up production certificates
 */

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");
const certsDir = join(rootDir, "certs");

// Parse command line arguments
const args = process.argv.slice(2);
const type = args[0] || "self-signed";

// Help text
if (type === "--help" || type === "-h") {
	console.log(`
Certificate Generation Tool for DXT Signing

Usage: node generate-certs.js [type]

Types:
  self-signed    Generate self-signed certificate (default)
  production     Instructions for production certificates

Options:
  --help, -h     Show this help message

Generated files (in certs/ directory):
  cert.pem       Certificate file
  key.pem        Private key file
  cert.pfx       PKCS#12 bundle (optional)

Examples:
  # Generate self-signed certificate
  node generate-certs.js

  # Get production certificate instructions
  node generate-certs.js production
`);
	process.exit(0);
}

console.log("🔐 Certificate Generation Tool\n");

// Create certs directory if it doesn't exist
if (!existsSync(certsDir)) {
	mkdirSync(certsDir, { recursive: true });
	console.log(`📁 Created certs directory: ${certsDir}`);
}

if (type === "production") {
	// Production certificate instructions
	console.log("📋 Production Certificate Setup Instructions\n");

	console.log("1️⃣  Obtain a Code Signing Certificate:");
	console.log("   - Purchase from a trusted Certificate Authority (CA)");
	console.log("   - Common providers: DigiCert, Sectigo, GlobalSign");
	console.log("   - Ensure it has Code Signing extended key usage\n");

	console.log("2️⃣  Convert to PEM format (if needed):");
	console.log("   # From PKCS#12 (.p12/.pfx):");
	console.log("   openssl pkcs12 -in certificate.p12 -out cert.pem -nokeys");
	console.log(
		"   openssl pkcs12 -in certificate.p12 -out key.pem -nocerts -nodes\n",
	);

	console.log("   # From DER (.cer/.crt):");
	console.log(
		"   openssl x509 -inform DER -in certificate.cer -out cert.pem\n",
	);

	console.log("3️⃣  Place certificates in the certs/ directory:");
	console.log(`   - Certificate: ${join(certsDir, "cert.pem")}`);
	console.log(`   - Private Key: ${join(certsDir, "key.pem")}`);
	console.log(`   - Intermediates: ${join(certsDir, "intermediate*.pem")}\n`);

	console.log("4️⃣  Set permissions (important for security):");
	console.log("   chmod 600 certs/key.pem");
	console.log("   chmod 644 certs/cert.pem\n");

	console.log("5️⃣  For CI/CD, use GitHub Secrets:");
	console.log("   - SIGNING_CERT: Base64-encoded certificate");
	console.log("   - SIGNING_KEY: Base64-encoded private key");
	console.log("   - Encode: base64 -i cert.pem | pbcopy");

	process.exit(0);
}

// Generate self-signed certificate
console.log("🔧 Generating self-signed certificate for development...\n");

try {
	// Check if OpenSSL is available
	try {
		execSync("openssl version", { stdio: "pipe" });
	} catch {
		console.error("❌ OpenSSL not found. Please install OpenSSL first:");
		console.error("   macOS: brew install openssl");
		console.error("   Ubuntu/Debian: sudo apt-get install openssl");
		console.error("   Windows: Download from https://www.openssl.org/");
		process.exit(1);
	}

	const certPath = join(certsDir, "cert.pem");
	const keyPath = join(certsDir, "key.pem");
	const csrPath = join(certsDir, "cert.csr");
	const configPath = join(certsDir, "openssl.cnf");

	// Check if certificates already exist
	if (existsSync(certPath) && existsSync(keyPath)) {
		console.log("⚠️  Certificates already exist:");
		console.log(`   Certificate: ${certPath}`);
		console.log(`   Private Key: ${keyPath}`);
		console.log("\n   Delete these files first if you want to regenerate.");
		process.exit(0);
	}

	// Create OpenSSL config for code signing
	const opensslConfig = `
[req]
default_bits = 2048
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
C = US
ST = Development
L = Development
O = Lokalise MCP Development
OU = Development
CN = Lokalise MCP Development Certificate
emailAddress = dev@localhost

[v3_req]
keyUsage = digitalSignature
extendedKeyUsage = codeSigning
subjectAltName = @alt_names

[alt_names]
email = dev@localhost
`;

	writeFileSync(configPath, opensslConfig.trim());
	console.log("📝 Created OpenSSL configuration");

	// Generate private key
	console.log("🔑 Generating private key...");
	execSync(`openssl genrsa -out "${keyPath}" 2048`, {
		stdio: "pipe",
		cwd: certsDir,
	});

	// Generate certificate signing request
	console.log("📋 Generating certificate signing request...");
	execSync(
		`openssl req -new -key "${keyPath}" -out "${csrPath}" -config "${configPath}"`,
		{
			stdio: "pipe",
			cwd: certsDir,
		},
	);

	// Generate self-signed certificate (valid for 1 year)
	console.log("📜 Generating self-signed certificate...");
	execSync(
		`openssl x509 -req -days 365 -in "${csrPath}" -signkey "${keyPath}" -out "${certPath}" -extensions v3_req -extfile "${configPath}"`,
		{
			stdio: "pipe",
			cwd: certsDir,
		},
	);

	// Set appropriate permissions
	if (process.platform !== "win32") {
		execSync(`chmod 600 "${keyPath}"`, { stdio: "pipe" });
		execSync(`chmod 644 "${certPath}"`, { stdio: "pipe" });
		console.log("🔒 Set file permissions");
	}

	// Display certificate information
	console.log("\n📋 Certificate Information:");
	const certInfo = execSync(
		`openssl x509 -in "${certPath}" -noout -subject -issuer -dates`,
		{
			encoding: "utf8",
			cwd: certsDir,
		},
	);
	console.log(certInfo);

	// Clean up temporary files
	if (existsSync(csrPath)) {
		execSync(`rm "${csrPath}"`, { stdio: "pipe" });
	}
	if (existsSync(configPath)) {
		execSync(`rm "${configPath}"`, { stdio: "pipe" });
	}

	console.log("✅ Self-signed certificate generated successfully!\n");
	console.log("📁 Certificate files:");
	console.log(`   Certificate: ${certPath}`);
	console.log(`   Private Key: ${keyPath}`);
	console.log(
		"\n⚠️  Note: This is a self-signed certificate for development only.",
	);
	console.log("   For production, use a certificate from a trusted CA.");
	console.log("\n🚀 You can now sign DXT packages with:");
	console.log("   npm run release:sign <dxt-file>");
} catch (error) {
	console.error(`\n❌ Error generating certificate: ${error.message}`);

	// Clean up partial files
	const tempFiles = [join(certsDir, "cert.csr"), join(certsDir, "openssl.cnf")];

	tempFiles.forEach((file) => {
		if (existsSync(file)) {
			try {
				execSync(`rm "${file}"`, { stdio: "pipe" });
			} catch {}
		}
	});

	process.exit(1);
}
