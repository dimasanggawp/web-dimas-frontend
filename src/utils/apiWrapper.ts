import { getAuth, logout } from "./auth";

type FetchOptions = RequestInit & {
    headers?: Record<string, string>;
};

export async function fetchWithAuth(url: string, options: FetchOptions = {}) {
    const { token } = getAuth();

    // Pastikan headers ada
    const headers: Record<string, string> = {
        "Accept": "application/json",
        ...(options.headers as Record<string, string>),
    };

    // Inject token jika ada
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    // Gabungkan options
    const config: RequestInit = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(url, config);

        // Handle 401 Unauthorized (Session Expired / Invalid Token)
        if (response.status === 401) {
            logout();
            // Redirect ke login page
            if (typeof window !== 'undefined') {
                window.location.href = "/login";
            }
        }

        return response;
    } catch (error) {
        throw error;
    }
}
