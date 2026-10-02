// biome-ignore-all lint/security/noDangerouslySetInnerHtml: Renderume parses Markdown with raw HTML disabled before it reaches the template.
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

function linkLabel(url: string): string {
	return url.replace(/^https?:\/\//, '')
}

function period(start: string, end?: string): string {
	return end ? `${start} — ${end}` : start
}

export function Resume({ cv }: ResumeProps) {
	const { contact } = cv.profile
	const links = [contact.website, contact.github, contact.linkedin].filter((url): url is string =>
		Boolean(url),
	)

	return (
		<main className="sidebar-resume">
			<header className="sidebar-header">
				<h1>{cv.profile.name}</h1>
				<p className="resume-title">{cv.profile.title}</p>
			</header>

			<div className="sidebar-layout">
				<div className="resume-main">
					<section className="section section-keep-together">
						<h2 className="section-title">Summary</h2>
						<div className="rich-text" dangerouslySetInnerHTML={{ __html: cv.summaryHtml }} />
					</section>

					<section className="section">
						<h2 className="section-title">Experience</h2>
						{cv.experience.map((item) => (
							<article
								className={
									item.pageBreakBefore ? 'experience-item page-break-before' : 'experience-item'
								}
								key={item.id}
							>
								<header className="experience-heading">
									<strong>{item.role}</strong>
									<span> · {period(item.start, item.end)}</span>
								</header>
								<p className="experience-company">
									{item.company}
									{item.location ? ` · ${item.location}` : ''}
								</p>
								<div className="rich-text" dangerouslySetInnerHTML={{ __html: item.bodyHtml }} />
								{item.stack.length > 0 ? <p className="stack">{item.stack.join(' · ')}</p> : null}
							</article>
						))}
					</section>

					{cv.projects.length > 0 ? (
						<section className="section section-keep-together">
							<h2 className="section-title">Projects</h2>
							{cv.projects.map((item) => (
								<article
									className={
										item.pageBreakBefore ? 'project-item page-break-before' : 'project-item'
									}
									key={item.id}
								>
									<header>
										<strong>{item.name}</strong>
										{item.url ? (
											<span>
												{' · '}
												<a href={item.url}>{linkLabel(item.url)}</a>
											</span>
										) : null}
									</header>
									<div className="rich-text" dangerouslySetInnerHTML={{ __html: item.bodyHtml }} />
									{item.stack.length > 0 ? <p className="stack">{item.stack.join(' · ')}</p> : null}
								</article>
							))}
						</section>
					) : null}

					{cv.educationHtml ? (
						<section className="section section-keep-together">
							<h2 className="section-title">Education</h2>
							<div className="rich-text" dangerouslySetInnerHTML={{ __html: cv.educationHtml }} />
						</section>
					) : null}
				</div>

				<aside className="resume-sidebar" aria-label="Contact and skills">
					<section className="section section-keep-together">
						<h2 className="section-title">Contact</h2>
						<ul className="contact-list">
							<li>
								<a href={`mailto:${contact.email}`}>{contact.email}</a>
							</li>
							{cv.profile.location ? <li>{cv.profile.location}</li> : null}
							{links.map((url) => (
								<li key={url}>
									<a href={url}>{linkLabel(url)}</a>
								</li>
							))}
						</ul>
					</section>

					{cv.skills.length > 0 ? (
						<section className="section section-keep-together">
							<h2 className="section-title">Skills</h2>
							<ul className="skills-list">
								{cv.skills.map((group) => (
									<li className="skill-group" key={group.name}>
										<strong>{group.name}:</strong> {group.items.join(', ')}
									</li>
								))}
							</ul>
						</section>
					) : null}
				</aside>
			</div>
		</main>
	)
}
