export default function getRandomNamespace() {
    const randomChars = Math.random().toString(36).substring(2, 10); // Generate a longer string
    return randomChars.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6); // Ensure it contains only alphanumeric characters
}