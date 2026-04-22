import Header from "./header.tsx"

function StatCard({
                      todos,
                      onDelete,
                  }: {
    todos: string[]
    onDelete: (index: number) => void
}) {
    return (
        <ul>
            {todos.map((todo, index) => (
                <Header
                    key={index}
                    todo={todo}
                    onDelete={() => onDelete(index)}
                />
            ))}
        </ul>
    )
}

export default StatCard