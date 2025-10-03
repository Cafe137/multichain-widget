interface Props {
    children: string
}

export function Typography({ children }: Props) {
    return <p className="multichain__text">{children}</p>
}
