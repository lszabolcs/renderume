/// <reference path="../jsx.d.ts" />

type SkillGroupProps = {
	items: string[]
	name: string
}

export function SkillGroup({ items, name }: SkillGroupProps) {
	return (
		<li className="keep-together skill-group">
			<strong>{name}:</strong> {items.join(', ')}
		</li>
	)
}
