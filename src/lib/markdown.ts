import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

marked.setOptions({ gfm: true, breaks: true });

const sanitizeOptions: sanitizeHtml.IOptions = {
	allowedTags: [
		'p', 'br', 'strong', 'em', 'del', 'code', 'pre', 'blockquote',
		'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
		'ul', 'ol', 'li', 'a', 'img', 'hr',
		'table', 'thead', 'tbody', 'tr', 'th', 'td'
	],
	allowedAttributes: {
		a: ['href', 'title', 'target', 'rel'],
		img: ['src', 'alt', 'title'],
		code: ['class'],
		pre: ['class'],
		th: ['align'],
		td: ['align']
	},
	allowedSchemes: ['http', 'https', 'mailto'],
	transformTags: {
		a: (tagName, attribs) => ({
			tagName,
			attribs: { ...attribs, target: '_blank', rel: 'noopener noreferrer' }
		})
	}
};

/** render markdown string to sanitized html */
export function rendermd(content: string): string {
	return sanitizeHtml(marked.parse(content, { async: false }), sanitizeOptions);
}

/** strip markdown syntax to plain text for previews */
export function stripmd(content: string): string {
	return content
		.replace(/#{1,6}\s+/g, '')
		.replace(/\*\*(.+?)\*\*/g, '$1')
		.replace(/\*(.+?)\*/g, '$1')
		.replace(/~~(.+?)~~/g, '$1')
		.replace(/`{1,3}[\s\S]*?`{1,3}/g, '')
		.replace(/\[(.+?)\]\(.+?\)/g, '$1')
		.replace(/!\[.*?\]\(.+?\)/g, '')
		.replace(/^[-*+]\s+/gm, '')
		.replace(/^>\s*/gm, '')
		.replace(/^---+$/gm, '')
		.replace(/\n+/g, ' ')
		.trim();
}
