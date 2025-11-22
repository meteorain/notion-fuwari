import type { APIRoute } from 'astro';
import { getSortedPosts } from '@/utils/content-utils';

export const GET: APIRoute = async () => {
	const posts = await getSortedPosts();

	const searchData = posts.map(async (post) => {
		const { remarkPluginFrontmatter } = await post.render();

		return {
			title: post.data.title,
			description: post.data.description,
			slug: post.slug,
			image: post.data.image || '', // 文章封面图片
			tags: post.data.tags || [],
			published: post.data.published.toISOString(),
			excerpt: remarkPluginFrontmatter.excerpt || post.data.description,
			// 移除 body 内容以减小 JSON 文件大小，搜索时只用标题、描述和摘录
		};
	});

	const data = await Promise.all(searchData);

	return new Response(JSON.stringify(data), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'public, max-age=3600', // 缓存 1 小时
		},
	});
};
