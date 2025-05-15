export async function querySingle(query: string): Promise<SearchProblem | null> {
    try {
        const req = await fetch(`https://solved.ac/api/v3/search/problem?query=${encodeURIComponent(query)}`)
        const problems: Resources<SearchProblem> = await req.json()
        return problems.items[0]
    } catch (e) {
        console.error(e)
        return null
    }
}

export type Resources<Item> = {
    count: number
    items: Item[]
}

export type SearchProblem = {
    problemId: number
}
