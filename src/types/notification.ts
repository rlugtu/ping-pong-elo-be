export interface Notification {
    title: string
    description: string
    cta: {
        name: string
        link: string | null
    }
}
