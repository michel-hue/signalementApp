function Header({
                      todo,
                      onDelete,
                  }: {
    todo: string
    onDelete: () => void
}) {
    return (
        <li>
            {todo}
            <button onClick={onDelete}>❌</button>
        </li>
    )
}

export default Header