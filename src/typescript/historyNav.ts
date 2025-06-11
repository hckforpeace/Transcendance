// Define types for our routes
type Route = {
  path: string;
  title: string;
  view: string;
  function?: (...args: any[]) => void | Promise<void>; // Accepts any parameters
};

// Application state
const appState = {
  currentPath: window.location.pathname
};

// Route configuration
const routes: Route[] = [
  {
    path: '/',
    view: '/html/home.html', 
    title: 'welcome'
  },
  {
    path: '/login',
    view: '/html/login.html', 
    title: 'login'
  },
  {
    path: '/games',
    view: '/html/game_menu.html', 
    title: 'games'
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
    title: 'lobby',
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
    title: 'register',
    function: renderProfile
  },
  {
    path: '/friend/:id', // Dynamic path parameter
    view: '/html/friendProfile.html',
    title: 'Friend Profile',
    function: (id?: any) => displayFriendCard(id) // Pass the id
  },
  {
    path: '/register',
    view: '/html/register.html', 
    title: 'register'
  },

];

// Function to handle navigation
function navigateTo(path: string): void {
  // Update browser history without reload
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

async function updateView(): Promise<void> {
  let currentRoute: Route | undefined = routes.find(route => route.path === appState.currentPath);

  let routeParams: Record<string, string> = {};

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
  await loadView(currentRoute.view);

  if (currentRoute.function) {
    currentRoute.function(...Object.values(routeParams));
  }
}
async function loadView(route: string): Promise<void> { 
  const response = await fetch(route);
  if (!response.ok) throw new Error('Failed to fetch');
  const data = await response.text();
  await injectViewToContentDiv(data); // Awaits DOM injection
}
// function 

// Function to handle link clicks
function handleRouteClick(event: MouseEvent): void {
  const target = event.target as HTMLAnchorElement;
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

function pathToRegex(path: string): RegExp {
  // Convert /friend/:id to /^\/friend\/([^/]+)$/
  return new RegExp('^' + path.replace(/:\w+/g, '([^/]+)') + '$');
}

function getParamNames(path: string): string[] {
  const matches = path.match(/:\w+/g);
  return matches ? matches.map(param => param.substring(1)) : [];
}
