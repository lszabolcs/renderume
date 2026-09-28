// biome-ignore-all lint/security/noDangerouslySetInnerHtml: Renderume parses Markdown with raw HTML disabled before it reaches the theme.
type ResumeData = {
	profile: {
		name: string
		title: string
		location?: string
		contact: {
			email: string
			website?: string
			github?: string
			linkedin?: string
		}
	}
	summaryHtml: string
	experience: Array<{
		id: string
		company: string
		role: string
		location?: string
		start: string
		end?: string
		stack: string[]
		pageBreakBefore: boolean
		bodyHtml: string
	}>
	projects: Array<{
		id: string
		name: string
		url?: string
		stack: string[]
		pageBreakBefore: boolean
		bodyHtml: string
	}>
	skills: Array<{
		name: string
		items: string[]
	}>
	educationHtml?: string
}

type ResumeProps = {
	cv: ResumeData
}

function period(start: string, end?: string): string {
	return end ? `${start} — ${end}` : start
}

function linkLabel(url: string): string {
	return url.replace(/^https?:\/\//, '')
}

export function Resume({ cv }: ResumeProps) {
	const { contact } = cv.profile
	const links = [contact.website, contact.github, contact.linkedin].filter((url): url is string =>
		Boolean(url),
	)
	const sections = [
		<section key="summary">
			<h2>Summary</h2>
			<div dangerouslySetInnerHTML={{ __html: cv.summaryHtml }} />
		</section>,
		<section key="experience">
			<h2>Experience</h2>
			{cv.experience.map((item) => (
				<article className={item.pageBreakBefore ? 'page-break-before' : undefined} key={item.id}>
					<header>
						<strong>{item.role}</strong>
						<span> · {period(item.start, item.end)}</span>
					</header>
					<p>
						{item.company}
						{item.location ? ` · ${item.location}` : ''}
					</p>
					<div dangerouslySetInnerHTML={{ __html: item.bodyHtml }} />
					{item.stack.length > 0 ? <p>{item.stack.join(' · ')}</p> : null}
				</article>
			))}
		</section>,
		cv.projects.length > 0 ? (
			<section key="projects">
				<h2>Projects</h2>
				{cv.projects.map((item) => (
					<article className={item.pageBreakBefore ? 'page-break-before' : undefined} key={item.id}>
						<header>
							<strong>{item.name}</strong>
							{item.url ? (
								<span>
									{' · '}
									<a href={item.url}>{linkLabel(item.url)}</a>
								</span>
							) : null}
						</header>
						<div dangerouslySetInnerHTML={{ __html: item.bodyHtml }} />
						{item.stack.length > 0 ? <p>{item.stack.join(' · ')}</p> : null}
					</article>
				))}
			</section>
		) : null,
		cv.skills.length > 0 ? (
			<section key="skills">
				<h2>Skills</h2>
				<ul>
					{cv.skills.map((group) => (
						<li key={group.name}>
							<strong>{group.name}:</strong> {group.items.join(', ')}
						</li>
					))}
				</ul>
			</section>
		) : null,
		cv.educationHtml ? (
			<section key="education">
				<h2>Education</h2>
				<div dangerouslySetInnerHTML={{ __html: cv.educationHtml }} />
			</section>
		) : null,
	]

	return (
		<main>
			<header>
				<h1>{cv.profile.name}</h1>
				<p>
					{cv.profile.title}
					{cv.profile.location ? ` · ${cv.profile.location}` : ''}
				</p>
				<p>
					<a href={`mailto:${contact.email}`}>{contact.email}</a>
					{links.map((url) => (
						<span key={url}>
							{' · '}
							<a href={url}>{linkLabel(url)}</a>
						</span>
					))}
				</p>
			</header>

			{sections}
		</main>
	)
}
