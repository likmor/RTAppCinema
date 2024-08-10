export async function fileExists(url: string) {
    const result = await fetch(url, { method: "HEAD" });
    return result.ok;
}