import type { APIRoute } from "astro";
import { getSortedPosts } from "@/utils/content-utils";
import { getPostUrlBySlugAndLang, isEnglishPostLanguage } from "@/utils/url-utils";

export const prerender = true;

export const GET: APIRoute = async () => {
	const posts = await getSortedPosts();

	const searchData = posts.map(async (post) => {
		const { remarkPluginFrontmatter } = await post.render();
		const locale = isEnglishPostLanguage(post.data.lang) || post.slug.startsWith("en/")
			? "en"
			: "zh-CN";
		const postUrl = getPostUrlBySlugAndLang(post.slug, locale);

		return {
			title: post.data.title,
			description: post.data.description,
			slug: post.slug,
			locale,
			url: postUrl,
			urlPath: new URL(postUrl, "https://example.com").pathname,
			image: post.data.image || "",
			tags: post.data.tags || [],
			published: post.data.published.toISOString(),
			excerpt: remarkPluginFrontmatter.excerpt || post.data.description,
		};
	});

	const data = await Promise.all(searchData);

	return new Response(JSON.stringify(data), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
