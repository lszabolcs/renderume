import type { ReactNode } from 'react'

type SectionProps = {
	children: ReactNode
	keepTogether?: boolean
	title: string
}

export function Section({ children, keepTogether = false, title }: SectionProps) {
	return (
		<section className={keepTogether ? 'section section-keep-together' : 'section'}>
			<h2 className="section-title">{title}</h2>
			{children}
		</section>
	)
}
