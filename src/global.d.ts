import type { AstroIntegration } from "@swup/astro";

declare global {
	interface Window {
		// type from '@swup/astro' is incorrect
		swup: AstroIntegration;
		adsbygoogle?: unknown[];
		// 防止脚本重复执行的标志
		__fuwariInitialized?: boolean;
		__fuwariSwupInitialized?: boolean;
		__fuwariFancyboxInitialized?: boolean;
		__fuwariAdsenseInitialized?: boolean;
	}
}
