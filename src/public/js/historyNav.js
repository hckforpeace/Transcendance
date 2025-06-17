"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Application state
const appState = {
    currentPath: window.location.pathname
};
// Route configuration
const routes = [
    {
        path: '/',
        view: '/html/home.html',
        title: 'Welcome'
    },
    {
        path: '/login',
        view: '/html/login.html',
        title: 'login',
        function: oauth2
    },
    {
        path: '/games',
        view: '/html/game_menu.html',
        title: 'Games'
    },
    {
        path: '/pong_remote',
        view: '/html/pong.html',
        title: 'Pong Remote',
        function: load_script_remote
    },
    {
        path: '/pong_tournement',
        view: '/html/tournement.html',
        title: 'Pong Tournement',
        // function: / 
    },
    {
        path: '/lobby',
        view: '/html/lobby.html',
        title: 'Lobby',
        function: wsEvent
    },
    {
        path: '/pong_ia',
        view: '/html/pong_ia.html',
        title: 'Pong IA',
        function: load_script
    },
    {
        path: '/profile',
        view: '/html/profile.html',
        title: 'Profile',
        function: renderProfile
    },
    {
        path: '/friend/:id', // Dynamic path parameter
        view: '/html/friendProfile.html',
        title: 'Friend Profile',
        function: (id) => displayFriendCard(id) // Pass the id
    },
    {
        path: '/register',
        view: '/html/register.html',
        title: 'Register'
    },
    {
        path: '/rgpd',
        view: '/html/rgpd.html',
        title: 'RGPD'
    },
    {
        path: '/tournament',
        view: '/html/tournament_menu.html',
        title: 'Tournament',
        function: init_tournamentMenu
    },
];
function isLoggedIn() {
    const jwt = jwt.verify();
}
// Function to handle navigation
function navigateTo(path) {
    socket === null || socket === void 0 ? void 0 : socket.close(); // Close socket connection if it exists
    // Update browser history without reload
    if ((path == '/games' || path == '/profile') && !isLoggedIn) {
        const errorMsg = document.getElementById("not-logged-in-msg");
        if (!errorMsg)
            return;
        errorMsg.style.color = "red";
        errorMsg.textContent = "You are not logged in";
        return;
    }
    window.history.pushState({}, '', path);
    appState.currentPath = path;
    updateView();
}
// Function to update the view based on current route
// async function updateView(): Promise<void> {
//   const currentRoute = routes.find(route => route.path === appState.currentPath) || routes[0];
//   document.title = currentRoute.title;
//   await loadView(currentRoute.view);
//   if (currentRoute.function)
//   currentRoute.function();
// }
function updateView() {
    return __awaiter(this, void 0, void 0, function* () {
        let currentRoute = routes.find(route => route.path === appState.currentPath);
        let routeParams = {};
        // Handle dynamic routes like /friend/:id
        if (!currentRoute) {
            for (const route of routes) {
                const routeRegex = pathToRegex(route.path);
                const match = appState.currentPath.match(routeRegex);
                if (match) {
                    currentRoute = route;
                    const paramNames = getParamNames(route.path);
                    const paramValues = match.slice(1);
                    routeParams = Object.fromEntries(paramNames.map((name, i) => [name, paramValues[i]]));
                    break;
                }
            }
        }
        if (!currentRoute) {
            console.error('Route not found');
            return;
        }
        console.log(currentRoute);
        document.title = currentRoute.title;
        yield loadView(currentRoute.view);
        if (currentRoute.function) {
            currentRoute.function(...Object.values(routeParams));
        }
    });
}
function loadView(route) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(route);
        if (!response.ok)
            throw new Error('Failed to fetch');
        const data = yield response.text();
        yield injectViewToContentDiv(data); // Awaits DOM injection
    });
}
// function 
// Function to handle link clicks
function handleRouteClick(event) {
    const target = event.target;
    event.preventDefault();
    const href = target.getAttribute('href');
    if (href) {
        navigateTo(href);
    }
}
// Handle browser back/forward buttons
window.addEventListener('popstate', (event) => {
    appState.currentPath = window.location.pathname;
    updateView();
});
function pathToRegex(path) {
    // Convert /friend/:id to /^\/friend\/([^/]+)$/
    return new RegExp('^' + path.replace(/:\w+/g, '([^/]+)') + '$');
}
function getParamNames(path) {
    const matches = path.match(/:\w+/g);
    return matches ? matches.map(param => param.substring(1)) : [];
}
