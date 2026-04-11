const sanitizeUrl = (url) => {
    const trimmed = (url || 'https://example.com').trim();
    return /^https?:\/\//i.test(trimmed) ? trimmed : 'https://' + trimmed.replace(/^\/+/, '');
};

const sanitizeHtml = (str) => {
    if (!str) return '';
    return String(str).replace(/[&<>"'/]/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;'
    })[c]);
};

export { sanitizeUrl, sanitizeHtml };
