/// <reference path="../jsx.d.ts" />

type SectionProps = {
	children: unknown
	keepTogether?: boolean
	title: string
}

export function Section({ children, keepTogether = false, title }: SectionProps) {
	return (
		<section className={keepTogether ? 'section section-keep-together' : 'section'}>
			<h2 className="section-title">{title}</h2>
			{children as never}
		</section>
	)
}
