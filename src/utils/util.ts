export function parseBearerToken(token: string): string {
    if (!token.includes('Bearer')) {
        throw new Error('improper token')
    }
    return token.split(' ')[1]
}
