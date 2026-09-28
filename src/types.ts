export type Profile = {
	name: string
	title: string
	email: string
}

export type Experience = {
	company: string
	role: string
	start: string
	end?: string
	bodyHtml: string
}

export type Resume = {
	profile: Profile
	summaryHtml: string
	experience: Experience[]
}
