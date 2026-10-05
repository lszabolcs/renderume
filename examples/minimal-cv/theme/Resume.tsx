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
			phone?: string
			links: Array<{
				label: string
				url: string
			}>
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

export function Resume({ cv }: ResumeProps) {
	const { contact } = cv.profile
	const sections = [
		<Section keepTogether key="summary" title="Summary">
			<div className="rich-text" dangerouslySetInnerHTML={{ __html: cv.summaryHtml }} />
		</Section>,
		<Section key="experience" title="Experience">
			{cv.experience.map((item) => (
				<ExperienceItem {...item} key={item.id} />
			))}
		</Section>,
		cv.projects.length > 0 ? (
			<Section keepTogether key="projects" title="Projects">
				{cv.projects.map((item) => (
					<ProjectItem {...item} key={item.id} />
				))}
			</Section>
		) : null,
		cv.skills.length > 0 ? (
			<Section keepTogether key="skills" title="Skills">
				<ul>
					{cv.skills.map((group) => (
						<SkillGroup {...group} key={group.name} />
					))}
				</ul>
			</Section>
		) : null,
		cv.educationHtml ? (
			<Section keepTogether key="education" title="Education">
				<KeepTogether>
					<div className="rich-text" dangerouslySetInnerHTML={{ __html: cv.educationHtml }} />
				</KeepTogether>
			</Section>
		) : null,
	]

	return (
		<main>
			<header className="resume-header">
				<h1>{cv.profile.name}</h1>
				<p className="resume-title">
					{cv.profile.title}
					{cv.profile.location ? ` · ${cv.profile.location}` : ''}
				</p>
				<p className="resume-contact">
					<a href={`mailto:${contact.email}`}>{contact.email}</a>
					{contact.phone ? (
						<span>
							{' · '}
							<a href={`tel:${contact.phone}`}>{contact.phone}</a>
						</span>
					) : null}
					{contact.links.map((link) => (
						<span key={link.url}>
							{' · '}
							<a href={link.url}>{link.label}</a>
						</span>
					))}
				</p>
			</header>

			{sections}
		</main>
	)
}
