import MarkdownIt from 'markdown-it'
import type { Resume } from './types.js'

const markdown = new MarkdownIt({ html: false, linkify: true, typographer: true })

function escapeHtml(value: string): string {
	return value.replace(/[&<>"']/g, (character) => {
		return (
			{ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character] ??
			character
		)
	})
}

function period(start: string, end?: string): string {
	return end ? `${start} — ${end}` : start
}

export function renderHtml(resume: Resume): string {
	const experience = resume.experience
		.map((item) => {
			return `<article>
  <header><strong>${escapeHtml(item.role)}</strong><span>${escapeHtml(period(item.start, item.end))}</span></header>
  <p>${escapeHtml(item.company)}</p>
  ${markdown.render(item.body)}
</article>`
		})
		.join('\n')

	return `<!doctype html>
<html lang='en'>
<head>
  <meta charset='utf-8'>
  <title>${escapeHtml(resume.profile.name)} — CV</title>
</head>
<body>
  <main>
    <header>
      <h1>${escapeHtml(resume.profile.name)}</h1>
      <p>${escapeHtml(resume.profile.title)} · <a href='mailto:${escapeHtml(resume.profile.email)}'>${escapeHtml(resume.profile.email)}</a></p>
    </header>
    <section>
      <h2>Summary</h2>
      ${markdown.render(resume.summary)}
    </section>
    <section>
      <h2>Experience</h2>
      ${experience}
    </section>
  </main>
</body>
</html>`
}
