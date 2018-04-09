import { Route } from './models/routes.models';

const routes: Route[] = [];

function addRoute(route: Route): void {
	routes.push(route);
}

function getRoutes(): Route[] {
	return routes;
}

export {
	addRoute,
	getRoutes
};
