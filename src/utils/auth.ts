export const setAuth = (token: string, user: any, remember: boolean) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('token', token);
    storage.setItem('user', JSON.stringify(user));
};

export const getAuth = () => {
    if (typeof window === 'undefined') return { token: null, user: null };

    // Check localStorage first (remember me)
    let token = localStorage.getItem('token');
    let user = localStorage.getItem('user');

    // If not in localStorage, check sessionStorage
    if (!token) {
        token = sessionStorage.getItem('token');
        user = sessionStorage.getItem('user');
    }

    return {
        token,
        user: user ? JSON.parse(user) : null
    };
};

export const logout = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
};
