import type { ReactNode } from 'react'

type SectionProps = {
	children: ReactNode
	title: string
}

export function Section({ children, title }: SectionProps) {
	return (
		<section className="section">
			<h2 className="section-title">{title}</h2>
			{children}
		</section>
	)
}
