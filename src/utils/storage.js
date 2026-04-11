const storage = {
    get(key, fallback = null) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch {
            return fallback;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn(`Storage write failed for key "${key}":`, e);
            return false;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch {}
    }
};

export default storage;
