const routes = new Set(['books', 'favorites', 'account', 'settings/reading', 'settings/pronunciation', 'login', 'register', 'forgot-password', 'reset-password']);
const requested = window.location.hash.replace(/^#\/(?:user-center\/)?/, '');
const target = routes.has(requested) ? requested : 'account';
window.location.replace(`/index.html${window.location.search}#/${target}`);
export {};
