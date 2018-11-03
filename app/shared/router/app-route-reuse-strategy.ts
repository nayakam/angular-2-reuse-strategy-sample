import {ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy} from "@angular/router";

interface IRouteStorageObject {
    snapshot: ActivatedRouteSnapshot;
    handle: DetachedRouteHandle;
}

export class AppRouteReuseStrategy implements RouteReuseStrategy {

    private static storedRoutes: { [key: string]: IRouteStorageObject } = {};

    /** Determines if this route (and its subtree) should be detached to be reused later
    */
    public shouldDetach(route: ActivatedRouteSnapshot): boolean {
        return route.data && route.data.reuse;
    }

    /** Stores the detached route */
    public store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        let storedRoute: IRouteStorageObject = {
            snapshot: route,
            handle: handle
        };
        if (route.data && route.data.reuse) {
            AppRouteReuseStrategy.storedRoutes[this.calculateRouteKey(route)] = storedRoute;
        }
    }

    /** Determines if this route (and its subtree) should be reattached */
    public shouldAttach(route: ActivatedRouteSnapshot): boolean {
        return AppRouteReuseStrategy.storedRoutes[this.calculateRouteKey(route)] !== undefined;
    }

    /** Retrieves the previously stored route */
    public retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
        if (AppRouteReuseStrategy.storedRoutes[this.calculateRouteKey(route)] === undefined) {
            return null;
        } else {
            return AppRouteReuseStrategy.storedRoutes[this.calculateRouteKey(route)].handle;
        }
    }

    /**
     * Determines whether or not the current route should be reused
     *
     * @param future The route the user is going to, as triggered by the router
     * @param curr The route the user is currently on
     * @returns boolean basically indicating false if the user is navigating away
     */
    public shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        let returnValue: boolean = (future.routeConfig === curr.routeConfig);
        if (future.routeConfig != null && curr.routeConfig != null) {
            returnValue = this.calculateRouteKey(future) === this.calculateRouteKey(curr);
            /** Not necessary to initiate routing or recreating component if routing with url params in same route */
            if (future.data && future.data.reuseChild && curr.data && curr.data.reuseChild
            && future.routeConfig.path === curr.routeConfig.path) {
                returnValue = true;
            }
        }
        return returnValue;
    }

    /**
     *  Remove the cached @IRouteStorageObject object for route
     *
     * @param {string} routeKey
     */
    public static clearStoredRouteForRoute(routeKey: string): void {
        if (routeKey && AppRouteReuseStrategy.storedRoutes[routeKey]) {
            AppRouteReuseStrategy.storedRoutes[routeKey] = undefined;
        } else {
            AppRouteReuseStrategy.storedRoutes = {};
        }
    }

    /**
     * Calculate the unique key for route using static route key, params and child route configs.
     */
    private calculateRouteKey(route: ActivatedRouteSnapshot): string {
        return route["_routerState"].url;
    }
}