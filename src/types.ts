export type Profile = {
	name: string
	title: string
	location?: string
	contact: {
		email: string
		phone?: string
		links: ContactLink[]
	}
}

export type ContactLink = {
	label: string
	url: string
}

export type Experience = {
	id: string
	company: string
	role: string
	location?: string
	start: string
	end?: string
	stack: string[]
	order: number
	pageBreakBefore: boolean
	bodyHtml: string
}

export type Project = {
	id: string
	name: string
	url?: string
	stack: string[]
	order: number
	pageBreakBefore: boolean
	bodyHtml: string
}

export type SkillGroup = {
	name: string
	items: string[]
}

export type Language = {
	language: string
	level: string
}

export type ResumeConfig = {
	locale: string
	output: {
		filename: string
		pageSize: 'A4'
		margin: string
	}
}

export type Resume = {
	config: ResumeConfig
	profile: Profile
	summaryHtml: string
	experience: Experience[]
	projects: Project[]
	skills: SkillGroup[]
	languages: Language[]
	educationHtml?: string
}
