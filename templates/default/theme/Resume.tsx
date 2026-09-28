// biome-ignore-all lint/security/noDangerouslySetInnerHtml: Renderume parses Markdown with raw HTML disabled before it reaches the theme.
import { ExperienceItem } from './components/ExperienceItem.js'
import { KeepTogether } from './components/KeepTogether.js'
import { ProjectItem } from './components/ProjectItem.js'
import { Section } from './components/Section.js'
import { SkillGroup } from './components/SkillGroup.js'

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

export function Resume({ cv }: ResumeProps) {
	const { contact } = cv.profile
	const links = [contact.website, contact.github, contact.linkedin].filter((url): url is string =>
		Boolean(url),
	)

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

			<Section title="Summary">
				<div className="rich-text" dangerouslySetInnerHTML={{ __html: cv.summaryHtml }} />
			</Section>

			<Section title="Experience">
				{cv.experience.map((item) => (
					<ExperienceItem {...item} key={item.id} />
				))}
			</Section>

			{cv.projects.length > 0 ? (
				<Section title="Projects">
					{cv.projects.map((item) => (
						<ProjectItem {...item} key={item.id} />
					))}
				</Section>
			) : null}

			{cv.skills.length > 0 ? (
				<Section title="Skills">
					<ul>
						{cv.skills.map((group) => (
							<SkillGroup {...group} key={group.name} />
						))}
					</ul>
				</Section>
			) : null}

			{cv.educationHtml ? (
				<Section title="Education">
					<KeepTogether>
						<div className="rich-text" dangerouslySetInnerHTML={{ __html: cv.educationHtml }} />
					</KeepTogether>
				</Section>
			) : null}
		</main>
	)
}
