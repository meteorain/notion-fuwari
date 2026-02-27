#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const checkOnly = args.includes('--check');

const POSTS_DIR = path.join(process.cwd(), 'src/content/posts');

function generateSlug(name) {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 100) || 'untitled';
}

function toRelativePath(filePath) {
	return path.relative(process.cwd(), filePath).replace(/\\/g, '/');
}

function getMarkdownFiles(dir) {
	if (!fs.existsSync(dir)) {
		return [];
	}

	const result = [];
	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			result.push(...getMarkdownFiles(fullPath));
			continue;
		}

		if (entry.isFile() && entry.name.endsWith('.md')) {
			result.push(fullPath);
		}
	}

	return result;
}

function normalizeLang(value) {
	if (!value || value === 'zh-CN' || value === 'zh_CN') {
		return 'zh-CN';
	}
	if (value === 'en') {
		return 'en';
	}
	return 'zh-CN';
}

function findFieldIndex(lines, fieldName) {
	const regex = new RegExp(`^\\s*${fieldName}\\s*:`);
	return lines.findIndex(line => regex.test(line));
}

function parseFieldValue(line) {
	const match = line.match(/^\s*[\w-]+\s*:\s*(.*)$/);
	if (!match) return '';

	const rawValue = match[1].trim();
	if (!rawValue) return '';

	if (
		(rawValue.startsWith("'") && rawValue.endsWith("'")) ||
		(rawValue.startsWith('"') && rawValue.endsWith('"'))
	) {
		return rawValue.slice(1, -1);
	}

	return rawValue;
}

function quoteYamlString(value) {
	return `'${value.replace(/'/g, "''")}'`;
}

function getInsertIndex(lines) {
	const draftIndex = findFieldIndex(lines, 'draft');
	if (draftIndex >= 0) {
		return draftIndex + 1;
	}
	return lines.length;
}

function parseFrontmatter(content) {
	const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!match) return null;

	const block = match[0];
	const frontmatterContent = match[1];
	const eol = block.includes('\r\n') ? '\r\n' : '\n';

	return {
		frontmatterContent,
		block,
		eol,
	};
}

function processFile(filePath) {
	const originalContent = fs.readFileSync(filePath, 'utf-8');
	const parsed = parseFrontmatter(originalContent);

	if (!parsed) {
		return {
			filePath,
			skipped: true,
			reason: 'no-frontmatter',
		};
	}

	const { frontmatterContent, block, eol } = parsed;
	const lines = frontmatterContent.split(/\r?\n/);

	let langIndex = findFieldIndex(lines, 'lang');
	let translationKeyIndex = findFieldIndex(lines, 'translationKey');

	const rawLang = langIndex >= 0 ? parseFieldValue(lines[langIndex]) : '';
	const nextLang = normalizeLang(rawLang);

	const filename = path.basename(filePath, path.extname(filePath));
	const defaultTranslationKey = generateSlug(filename);
	const rawTranslationKey = translationKeyIndex >= 0 ? parseFieldValue(lines[translationKeyIndex]) : '';
	const nextTranslationKey = rawTranslationKey || defaultTranslationKey;

	let changed = false;

	const langLine = `lang: ${quoteYamlString(nextLang)}`;
	if (langIndex >= 0) {
		if (lines[langIndex] !== langLine) {
			lines[langIndex] = langLine;
			changed = true;
		}
	} else {
		const insertAt = getInsertIndex(lines);
		lines.splice(insertAt, 0, langLine);
		langIndex = insertAt;
		if (translationKeyIndex >= insertAt) {
			translationKeyIndex += 1;
		}
		changed = true;
	}

	const translationKeyLine = `translationKey: ${quoteYamlString(nextTranslationKey)}`;
	if (translationKeyIndex >= 0) {
		if (lines[translationKeyIndex] !== translationKeyLine) {
			lines[translationKeyIndex] = translationKeyLine;
			changed = true;
		}
	} else {
		lines.splice(langIndex + 1, 0, translationKeyLine);
		changed = true;
	}

	if (changed && !checkOnly) {
		const updatedFrontmatter = lines.join(eol);
		const updatedBlock = `---${eol}${updatedFrontmatter}${eol}---`;
		const updatedContent = originalContent.replace(block, updatedBlock);
		fs.writeFileSync(filePath, updatedContent, 'utf-8');
	}

	return {
		filePath,
		skipped: false,
		changed,
		lang: nextLang,
		translationKey: nextTranslationKey,
		updatedLang: !rawLang || rawLang !== nextLang,
		updatedTranslationKey: !rawTranslationKey,
	};
}

function main() {
	console.log('🔄 Bilingual posts migration');
	console.log(`Mode: ${checkOnly ? 'check' : 'fix'}`);
	console.log(`Posts dir: ${toRelativePath(POSTS_DIR)}\n`);

	const files = getMarkdownFiles(POSTS_DIR).sort((a, b) => a.localeCompare(b));
	if (files.length === 0) {
		console.log('No markdown files found.');
		return;
	}

	const results = files.map(processFile);
	const skippedFiles = results.filter(result => result.skipped);
	const handledResults = results.filter(result => !result.skipped);

	const changedFiles = handledResults.filter(result => result.changed);
	const updatedLangFiles = handledResults.filter(result => result.updatedLang);
	const updatedTranslationKeyFiles = handledResults.filter(result => result.updatedTranslationKey);

	const keyMap = new Map();
	for (const result of handledResults) {
		const compositeKey = `${result.lang}::${result.translationKey}`;
		if (!keyMap.has(compositeKey)) {
			keyMap.set(compositeKey, []);
		}
		keyMap.get(compositeKey).push(result);
	}

	const duplicateGroups = Array.from(keyMap.entries())
		.map(([compositeKey, group]) => ({ compositeKey, group }))
		.filter(item => item.group.length > 1);

	const zhTranslationKeys = new Set(
		handledResults
			.filter(result => result.lang === 'zh-CN')
			.map(result => result.translationKey)
	);

	const orphanEnglishPosts = handledResults.filter(
		result => result.lang === 'en' && !zhTranslationKeys.has(result.translationKey)
	);

	console.log('Summary');
	console.log(`  - scanned: ${files.length}`);
	console.log(`  - parsed: ${handledResults.length}`);
	if (checkOnly) {
		console.log(`  - would update: ${changedFiles.length}`);
	} else {
		console.log(`  - updated: ${changedFiles.length}`);
	}
	console.log(`  - lang adjusted: ${updatedLangFiles.length}`);
	console.log(`  - translationKey filled: ${updatedTranslationKeyFiles.length}`);
	console.log(`  - skipped: ${skippedFiles.length}`);

	console.log('\nValidation');
	console.log(`  - duplicate (lang + translationKey): ${duplicateGroups.length}`);
	if (duplicateGroups.length > 0) {
		for (const { compositeKey, group } of duplicateGroups) {
			console.log(`    * ${compositeKey}`);
			for (const item of group) {
				console.log(`      - ${toRelativePath(item.filePath)}`);
			}
		}
	}

	console.log(`  - orphan english posts: ${orphanEnglishPosts.length}`);
	if (orphanEnglishPosts.length > 0) {
		for (const item of orphanEnglishPosts) {
			console.log(`    - ${toRelativePath(item.filePath)} (translationKey: ${item.translationKey})`);
		}
	}

	if (skippedFiles.length > 0) {
		console.log('\nSkipped files');
		for (const item of skippedFiles) {
			console.log(`  - ${toRelativePath(item.filePath)} (${item.reason})`);
		}
	}

	const hasPendingChanges = changedFiles.length > 0;
	const hasValidationIssues = duplicateGroups.length > 0 || orphanEnglishPosts.length > 0;
	if ((checkOnly && hasPendingChanges) || hasValidationIssues) {
		process.exitCode = 1;
	}
}

main();
