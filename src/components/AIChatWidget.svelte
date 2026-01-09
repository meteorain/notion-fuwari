<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import { aiChatConfig } from '../config';

	// 组件状态
	let isOpen = false;
	let messages: Array<{role: 'user' | 'assistant', content: string, sources?: any[]}> = [];
	let input = '';
	let loading = false;
	let error = '';
	let chatContainer: HTMLElement;

	// 从配置读取 API 端点
	const API_ENDPOINT = aiChatConfig.apiEndpoint;

	function toggleChat() {
		isOpen = !isOpen;
		if (isOpen && chatContainer) {
			setTimeout(() => {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}, 100);
		}
	}

	async function sendMessage() {
		if (!input.trim() || loading) return;

		const userMessage = input.trim();
		input = '';
		loading = true;
		error = '';

		// 检查是否配置了 API 端点
		if (!API_ENDPOINT) {
			error = '请先在 src/config.ts 中配置 aiChatConfig.apiEndpoint';
			loading = false;
			return;
		}

		// 添加用户消息
		messages = [...messages, { role: 'user', content: userMessage }];
		scrollToBottom();

		// 添加占位的 AI 消息
		const aiMessageIndex = messages.length;
		messages = [...messages, { role: 'assistant', content: '', sources: [] }];

		try {
			const response = await fetch(API_ENDPOINT, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					query: userMessage,
					stream: true,
				}),
			});

			if (!response.ok) {
				throw new Error(`API 错误: ${response.status}`);
			}

			const reader = response.body?.getReader();
			const decoder = new TextDecoder();

			if (!reader) throw new Error('无法读取响应流');

			let buffer = '';
			let fullResponse = '';
			let sources: any[] = [];

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split('\n');
				buffer = lines.pop() || '';

				for (const line of lines) {
					if (!line.trim() || !line.startsWith('data: ')) continue;

					try {
						const data = JSON.parse(line.slice(6));

						// 处理流式响应
						if (data.result?.response) {
							fullResponse = data.result.response;
							sources = data.result.data || [];

							// 更新消息
							messages = messages.map((msg, idx) =>
								idx === aiMessageIndex
									? { ...msg, content: fullResponse, sources }
									: msg
							);
							scrollToBottom();
						}
					} catch (e) {
						console.warn('解析流数据失败:', line);
					}
				}
			}

			// 最终处理剩余 buffer
			if (buffer.trim() && buffer.startsWith('data: ')) {
				try {
					const data = JSON.parse(buffer.slice(6));
					if (data.result?.response) {
						messages = messages.map((msg, idx) =>
							idx === aiMessageIndex
								? { ...msg, content: data.result.response, sources: data.result.data || [] }
								: msg
						);
					}
				} catch (e) {
					console.warn('解析最终数据失败');
				}
			}

		} catch (err) {
			error = err instanceof Error ? err.message : '发送消息失败';
			// 移除失败的 AI 消息
			messages = messages.slice(0, -1);
		} finally {
			loading = false;
			scrollToBottom();
		}
	}

	function scrollToBottom() {
		if (chatContainer) {
			setTimeout(() => {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}, 0);
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	onMount(() => {
		// 添加欢迎消息
		messages = [
			{
				role: 'assistant',
				content: aiChatConfig.welcomeMessage,
			},
		];
	});
</script>

<!-- 浮动按钮 -->
{#if !isOpen}
	<button
		class="ai-chat-button"
		on:click={toggleChat}
		aria-label="打开 AI 助手"
	>
		<Icon icon="material-symbols:chat-outline" width="24" height="24" />
	</button>
{/if}

<!-- 对话窗口 -->
{#if isOpen}
	<div class="ai-chat-window">
		<!-- 标题栏 -->
		<div class="ai-chat-header">
			<div class="flex items-center gap-2">
				<Icon icon="material-symbols:smart-toy-outline" width="20" height="20" />
				<span class="font-semibold">AI 助手</span>
			</div>
			<button
				class="ai-close-button"
				on:click={toggleChat}
				aria-label="关闭"
			>
				<Icon icon="material-symbols:close" width="20" height="20" />
			</button>
		</div>

		<!-- 消息列表 -->
		<div class="ai-chat-messages" bind:this={chatContainer}>
			{#each messages as message}
				<div class="ai-message ai-message-{message.role}">
					<div class="ai-message-icon">
						{#if message.role === 'user'}
							<Icon icon="material-symbols:person" width="20" height="20" />
						{:else}
							<Icon icon="material-symbols:smart-toy-outline" width="20" height="20" />
						{/if}
					</div>
					<div class="ai-message-content">
						<div class="ai-message-text">{message.content}</div>

						<!-- 显示来源 -->
						{#if message.sources && message.sources.length > 0}
							<div class="ai-sources">
								<div class="ai-sources-title">
									<Icon icon="material-symbols:source" width="14" height="14" />
									<span>来源引用：</span>
								</div>
								{#each message.sources.slice(0, 3) as source}
									<div class="ai-source-item">
										<Icon icon="material-symbols:description-outline" width="12" height="12" />
										<span class="ai-source-filename">{source.filename}</span>
										<span class="ai-source-score">({(source.score * 100).toFixed(0)}%)</span>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			{/each}

			{#if loading}
				<div class="ai-message ai-message-assistant">
					<div class="ai-message-icon">
						<Icon icon="material-symbols:smart-toy-outline" width="20" height="20" />
					</div>
					<div class="ai-message-content">
						<div class="ai-loading">
							<span></span>
							<span></span>
							<span></span>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- 错误提示 -->
		{#if error}
			<div class="ai-error">
				<Icon icon="material-symbols:error-outline" width="16" height="16" />
				<span>{error}</span>
			</div>
		{/if}

		<!-- 输入框 -->
		<div class="ai-chat-input">
			<textarea
				bind:value={input}
				on:keypress={handleKeyPress}
				placeholder="输入问题... (Enter 发送, Shift+Enter 换行)"
				rows="2"
				disabled={loading}
			></textarea>
			<button
				class="ai-send-button"
				on:click={sendMessage}
				disabled={!input.trim() || loading}
				aria-label="发送"
			>
				<Icon icon="material-symbols:send" width="20" height="20" />
			</button>
		</div>
	</div>
{/if}

<style>
	/* 浮动按钮 */
	.ai-chat-button {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: var(--primary);
		color: white;
		border: none;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		z-index: 1000;
	}

	.ai-chat-button:hover {
		transform: scale(1.1);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
	}

	/* 对话窗口 */
	.ai-chat-window {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		width: 400px;
		max-width: calc(100vw - 4rem);
		height: 600px;
		max-height: calc(100vh - 4rem);
		background: var(--card-bg);
		border-radius: var(--radius-large);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
		display: flex;
		flex-direction: column;
		z-index: 1000;
		animation: slideUp 0.3s ease;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* 标题栏 */
	.ai-chat-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		border-bottom: 1px solid var(--line-divider);
		color: var(--primary);
	}

	.ai-close-button {
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 0.375rem;
		color: var(--text-secondary);
		transition: all 0.2s;
	}

	.ai-close-button:hover {
		background: rgba(0, 0, 0, 0.05);
		color: var(--text-primary);
	}

	:global(.dark) .ai-close-button:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	/* 消息列表 */
	.ai-chat-messages {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.ai-message {
		display: flex;
		gap: 0.75rem;
		animation: fadeIn 0.3s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.ai-message-icon {
		flex-shrink: 0;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.ai-message-user .ai-message-icon {
		background: var(--primary);
		color: white;
	}

	.ai-message-assistant .ai-message-icon {
		background: rgba(var(--primary-rgb), 0.1);
		color: var(--primary);
	}

	.ai-message-content {
		flex: 1;
		min-width: 0;
	}

	.ai-message-text {
		background: rgba(0, 0, 0, 0.03);
		padding: 0.75rem;
		border-radius: 0.75rem;
		font-size: 0.875rem;
		line-height: 1.5;
		color: var(--text-primary);
		white-space: pre-wrap;
		word-wrap: break-word;
	}

	:global(.dark) .ai-message-text {
		background: rgba(255, 255, 255, 0.05);
	}

	.ai-message-user .ai-message-text {
		background: var(--primary);
		color: white;
	}

	/* 来源引用 */
	.ai-sources {
		margin-top: 0.5rem;
		padding: 0.5rem;
		background: rgba(0, 0, 0, 0.02);
		border-radius: 0.5rem;
		font-size: 0.75rem;
	}

	:global(.dark) .ai-sources {
		background: rgba(255, 255, 255, 0.03);
	}

	.ai-sources-title {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		color: var(--text-secondary);
		margin-bottom: 0.25rem;
		font-weight: 500;
	}

	.ai-source-item {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		color: var(--text-secondary);
		padding: 0.25rem 0;
	}

	.ai-source-filename {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.ai-source-score {
		color: var(--primary);
		font-weight: 500;
	}

	/* 加载动画 */
	.ai-loading {
		display: flex;
		gap: 0.25rem;
		padding: 0.75rem;
	}

	.ai-loading span {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--primary);
		animation: bounce 1.4s infinite ease-in-out both;
	}

	.ai-loading span:nth-child(1) {
		animation-delay: -0.32s;
	}

	.ai-loading span:nth-child(2) {
		animation-delay: -0.16s;
	}

	@keyframes bounce {
		0%, 80%, 100% {
			transform: scale(0);
			opacity: 0.5;
		}
		40% {
			transform: scale(1);
			opacity: 1;
		}
	}

	/* 错误提示 */
	.ai-error {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: rgba(239, 68, 68, 0.1);
		color: rgb(239, 68, 68);
		font-size: 0.875rem;
		border-top: 1px solid var(--line-divider);
	}

	/* 输入框 */
	.ai-chat-input {
		display: flex;
		gap: 0.5rem;
		padding: 1rem;
		border-top: 1px solid var(--line-divider);
	}

	.ai-chat-input textarea {
		flex: 1;
		resize: none;
		border: 1px solid var(--line-divider);
		border-radius: 0.5rem;
		padding: 0.75rem;
		font-size: 0.875rem;
		background: var(--card-bg);
		color: var(--text-primary);
		font-family: inherit;
	}

	.ai-chat-input textarea:focus {
		outline: none;
		border-color: var(--primary);
	}

	.ai-chat-input textarea:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.ai-send-button {
		flex-shrink: 0;
		width: 40px;
		height: 40px;
		border-radius: 0.5rem;
		background: var(--primary);
		color: white;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
		align-self: flex-end;
	}

	.ai-send-button:hover:not(:disabled) {
		opacity: 0.9;
		transform: scale(1.05);
	}

	.ai-send-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* 移动端适配 */
	@media (max-width: 640px) {
		.ai-chat-window {
			width: calc(100vw - 2rem);
			height: calc(100vh - 2rem);
			bottom: 1rem;
			right: 1rem;
		}

		.ai-chat-button {
			bottom: 1rem;
			right: 1rem;
		}
	}
</style>
