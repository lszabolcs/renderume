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
	body: string
}

export type Resume = {
	profile: Profile
	summary: string
	experience: Experience[]
}
