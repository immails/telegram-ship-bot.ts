export function escape(string : String) {
    return string.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;")
}

export interface bot_user {
    fn: string,
    un: string | null
}