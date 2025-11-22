<script lang="ts">

import Icon from "@iconify/svelte";
import { url } from "@utils/url-utils.ts";
import { onMount } from "svelte";

// 接收翻译文本props
export let searchPlaceholder = "搜索";
export let searchPlaceholderEn = "Search";

interface SearchResult {
	url: string;
	meta: {
		title: string;
	};
	excerpt: string;
	urlPath?: string;
	image?: string; // 添加封面图片字段
}

let keywordDesktop = "";
let keywordMobile = "";
let result: SearchResult[] = [];
let isSearching = false;
let posts: any[] = [];

const togglePanel = () => {
	const panel = document.getElementById("search-panel");
	panel?.classList.toggle("float-panel-closed");
};

const setPanelVisibility = (show: boolean, isDesktop: boolean): void => {
	const panel = document.getElementById("search-panel");
	if (!panel || !isDesktop) return;

	if (show) {
		panel.classList.remove("float-panel-closed");
	} else {
		panel.classList.add("float-panel-closed");
	}
};

const highlightText = (text: string, keyword: string): string => {
	if (!keyword) return text;
	const regex = new RegExp(`(${keyword})`, "gi");
	return text.replace(regex, "<mark>$1</mark>");
};

const search = async (keyword: string, isDesktop: boolean): Promise<void> => {
	if (!keyword) {
		setPanelVisibility(false, isDesktop);
		result = [];
		return;
	}

	isSearching = true;

	try {
		const searchResults = posts
			.filter((post) => {
				const keywordLower = keyword.toLowerCase();
				const searchText =
					`${post.title} ${post.description} ${post.excerpt}`.toLowerCase();
				const urlPath = `/posts/${post.slug}`;

				// 支持内容搜索和URL后缀搜索
				return searchText.includes(keywordLower) ||
					   urlPath.toLowerCase().includes(keywordLower) ||
					   post.slug.toLowerCase().includes(keywordLower);
			})
			.map((post) => {
				const descLower = (post.excerpt || post.description || '').toLowerCase();
				const keywordLower = keyword.toLowerCase();
				const contentIndex = descLower.indexOf(keywordLower);

				let excerpt = '';
				if (contentIndex !== -1) {
					const fullText = post.excerpt || post.description || '';
					const start = Math.max(0, contentIndex - 50);
					const end = Math.min(fullText.length, contentIndex + 100);
					excerpt = fullText.substring(start, end);
					if (start > 0) excerpt = '...' + excerpt;
					if (end < fullText.length) excerpt = excerpt + '...';
				} else {
					excerpt = post.description || (post.excerpt ? post.excerpt.substring(0, 150) + '...' : '');
				}

				return {
					url: url(`/posts/${post.slug}/`),
					meta: {
						title: post.title
					},
					excerpt: highlightText(excerpt, keyword),
					urlPath: `/posts/${post.slug}`,
					image: post.image || '' // 包含封面图片
				};
			});

		result = searchResults;
		setPanelVisibility(result.length > 0, isDesktop);
	} catch (error) {
		console.error("Search error:", error);
		result = [];
		setPanelVisibility(false, isDesktop);
	} finally {
		isSearching = false;
	}
};

onMount(async () => {
	try {
		// 改用新的搜索数据 API
		const response = await fetch("/api/search-data.json");
		const data = await response.json();

		posts = data.map((item: any) => ({
			title: item.title,
			description: item.description,
			slug: item.slug,
			image: item.image,
			excerpt: item.excerpt,
			tags: item.tags,
			published: item.published,
		}));
	} catch (error) {
		console.error("Error fetching search data:", error);
	}

	// 监听语言切换事件
	const updateSearchPlaceholder = () => {
		const currentLocale = localStorage.getItem('preferred-locale') || 'zh-CN';
		if (currentLocale === 'zh-CN') {
			searchPlaceholder = "搜索";
		} else {
			searchPlaceholder = "Search";
		}
	};

	// 初始化时更新
	updateSearchPlaceholder();

	// 监听语言变化
	const observer = new MutationObserver((mutations) => {
		mutations.forEach((mutation) => {
			if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
				// 检测到DOM变化，可能是语言切换导致的刷新
				setTimeout(updateSearchPlaceholder, 100);
			}
		});
	});

	observer.observe(document.body, { attributes: true, childList: true, subtree: true });
});

$: search(keywordDesktop, true);
$: search(keywordMobile, false);
</script>

<!-- search bar for desktop view -->
<div id="search-bar" class="hidden lg:flex transition-all items-center h-11 mr-2 rounded-lg
      bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
      dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10
">
    <Icon icon="material-symbols:search" class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30"></Icon>
    <input placeholder={searchPlaceholder} bind:value={keywordDesktop} on:focus={() => search(keywordDesktop, true)}
           class="transition-all pl-10 text-sm bg-transparent outline-0
         h-full w-40 active:w-60 focus:w-60 text-black/50 dark:text-white/50"
    >
</div>

<!-- toggle btn for phone/tablet view -->
<button on:click={togglePanel} aria-label="Search Panel" id="search-switch"
        class="btn-plain scale-animation lg:!hidden rounded-lg w-11 h-11 active:scale-90">
    <Icon icon="material-symbols:search" class="text-[1.25rem]"></Icon>
</button>

<!-- search panel -->
<div id="search-panel" class="float-panel float-panel-closed search-panel absolute md:w-[30rem]
top-20 left-4 md:left-[unset] right-4 shadow-2xl rounded-2xl p-2">

    <!-- search bar inside panel for phone/tablet -->
    <div id="search-bar-inside" class="flex relative lg:hidden transition-all items-center h-11 rounded-xl
      bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
      dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10
  ">
        <Icon icon="material-symbols:search" class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30"></Icon>
        <input placeholder={searchPlaceholderEn} bind:value={keywordMobile}
               class="pl-10 absolute inset-0 text-sm bg-transparent outline-0
               focus:w-60 text-black/50 dark:text-white/50"
        >
    </div>

    <!-- search results -->
    {#each result as item}
        <a href={item.url}
           class="transition first-of-type:mt-2 lg:first-of-type:mt-0 group block
       rounded-xl px-3 py-2 hover:bg-[var(--btn-plain-bg-hover)] active:bg-[var(--btn-plain-bg-active)]
       {item.image ? 'flex gap-3' : ''}">

            <!-- 文章封面图片（如果有） -->
            {#if item.image}
                <div class="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-[var(--btn-regular-bg)]">
                    <img
                        src={item.image}
                        alt={item.meta.title}
                        class="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>
            {/if}

            <!-- 文本内容 -->
            <div class="flex-1 min-w-0">
                <div class="transition text-90 inline-flex font-bold group-hover:text-[var(--primary)]">
                    {item.meta.title}<Icon icon="fa6-solid:chevron-right" class="transition text-[0.75rem] translate-x-1 my-auto text-[var(--primary)]"></Icon>
                </div>
                <div class="transition text-xs text-50 mb-1 font-mono">
                    {item.urlPath}
                </div>
                <div class="transition text-sm text-50 line-clamp-2">
                    {@html item.excerpt}
                </div>
            </div>
        </a>
    {/each}
</div>

<style>
  input:focus {
    outline: 0;
  }
  .search-panel {
    max-height: calc(100vh - 100px);
    overflow-y: auto;
  }
</style>
