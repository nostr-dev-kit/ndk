import { codeToHtml } from 'shiki';

export async function highlightCode(code: string, lang: string = 'typescript') {
	try {
		const html = await codeToHtml(code, {
			lang,
			themes: {
				light: 'github-light',
				dark: 'github-dark'
			}
		});
		return { html, isLoading: false };
	} catch (error) {
		console.error('Failed to highlight code:', error);
		return { html: `<pre><code>${code}</code></pre>`, isLoading: false };
	}
}
