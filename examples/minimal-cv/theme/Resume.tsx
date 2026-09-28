// biome-ignore-all lint/security/noDangerouslySetInnerHtml: Renderume parses Markdown with raw HTML disabled before it reaches the theme.
type ResumeData = {
	profile: {
		name: string
		title: string
		email: string
	}
	summaryHtml: string
	experience: Array<{
		company: string
		role: string
		start: string
		end?: string
		bodyHtml: string
	}>
}

type ResumeProps = {
	cv: ResumeData
}

function period(start: string, end?: string): string {
	return end ? `${start} — ${end}` : start
}

export function Resume({ cv }: ResumeProps) {
	return (
		<main>
			<header>
				<h1>{cv.profile.name}</h1>
				<p>
					{cv.profile.title} · <a href={`mailto:${cv.profile.email}`}>{cv.profile.email}</a>
				</p>
			</header>
			<section>
				<h2>Summary</h2>
				<div dangerouslySetInnerHTML={{ __html: cv.summaryHtml }} />
			</section>
			<section>
				<h2>Experience</h2>
				{cv.experience.map((item) => (
					<article key={`${item.company}-${item.start}`}>
						<header>
							<strong>{item.role}</strong>
							<span> · {period(item.start, item.end)}</span>
						</header>
						<p>{item.company}</p>
						<div dangerouslySetInnerHTML={{ __html: item.bodyHtml }} />
					</article>
				))}
			</section>
		</main>
	)
}
