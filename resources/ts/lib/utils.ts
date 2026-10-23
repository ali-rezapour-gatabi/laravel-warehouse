export { cn } from "cn"

export function formatDate(date?: string) {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "—";

    return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).format(parsed);
}
