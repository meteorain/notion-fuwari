export function pathsEqual(path1: string, path2: string) {
	const normalizedPath1 = path1.replace(/^\/|\/$/g, "").toLowerCase();
	const normalizedPath2 = path2.replace(/^\/|\/$/g, "").toLowerCase();
	return normalizedPath1 === normalizedPath2;
}

const ENGLISH_LANGUAGE_CODES = new Set(["en", "en-us"]);
const CHINESE_LANGUAGE_CODES = new Set(["", "zh", "zh-cn", "zh-hans"]);

function joinUrl(...parts: string[]): string {
	const joined = parts.join("/");
	return joined.replace(/\/+/g, "/");
}

export function getPostUrlBySlug(slug: string): string {
	const normalizedSlug = slug.replace(/^\/+|\/+$/g, "");
	return url(`/posts/${normalizedSlug}/`);
}

function normalizeLanguageCode(lang?: string | null): string {
	return (lang ?? "").trim().replace(/_/g, "-").toLowerCase();
}

export function isEnglishPostLanguage(lang?: string | null): boolean {
	return ENGLISH_LANGUAGE_CODES.has(normalizeLanguageCode(lang));
}

export function isChinesePostLanguage(lang?: string | null): boolean {
	return CHINESE_LANGUAGE_CODES.has(normalizeLanguageCode(lang));
}

export function normalizePostLanguage(lang?: string | null): "zh-CN" | "en" {
	return isEnglishPostLanguage(lang) ? "en" : "zh-CN";
}

export function getPostTranslationKey(slug: string): string {
	const normalizedSlug = slug.replace(/^\/+|\/+$/g, "");
	return normalizedSlug.replace(/^(?:en|zh(?:[-_](?:cn|hans))?)\//i, "");
}

export function getPostUrlBySlugAndLang(
	slug: string,
	lang?: string | null,
): string {
	const translationKey = getPostTranslationKey(slug);
	if (isEnglishPostLanguage(lang)) {
		return url(`/posts/en/${translationKey}/`);
	}
	return url(`/posts/${translationKey}/`);
}

export function getDir(path: string): string {
	const lastSlashIndex = path.lastIndexOf("/");
	if (lastSlashIndex < 0) {
		return "/";
	}
	return path.substring(0, lastSlashIndex + 1);
}

export function url(path: string) {
	return joinUrl("", import.meta.env.BASE_URL, path);
}
