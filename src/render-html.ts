function escapeHtml(value: string): string {
	return value.replace(/[&<>"']/g, (character) => {
		return (
			{ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character] ??
			character
		)
	})
}

export function renderHtml(title: string, body: string, styles = ''): string {
	return `<!doctype html>
<html lang='en'>
<head>
  <meta charset='utf-8'>
  <title>${escapeHtml(title)} — CV</title>
  <style>${styles}</style>
</head>
<body>
  ${body}
</body>
</html>`
}
