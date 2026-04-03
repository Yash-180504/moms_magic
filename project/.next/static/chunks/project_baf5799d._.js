(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/project/lib/api.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Same-origin API — no env var needed, works in dev and production
__turbopack_context__.s([
    "admin",
    ()=>admin,
    "auth",
    ()=>auth,
    "imgUrl",
    ()=>imgUrl,
    "menu",
    ()=>menu,
    "orders",
    ()=>orders,
    "providers",
    ()=>providers,
    "upload",
    ()=>upload
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/project/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const BASE = '/api';
const OPENINARY = ("TURBOPACK compile-time value", "https://openinary.adityaraj.codes") || 'https://openinary.adityaraj.codes';
function getToken() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return localStorage.getItem('mm_token');
}
function authHeaders() {
    const t = getToken();
    return t ? {
        Authorization: "Bearer ".concat(t)
    } : {};
}
async function request(path) {
    let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    let res;
    try {
        res = await fetch("".concat(BASE).concat(path), {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders(),
                ...options.headers
            }
        });
    } catch (e) {
        throw new Error("Network error while calling ".concat(path, ": ").concat(e.message));
    }
    const data = await res.json().catch(()=>({}));
    if (!res.ok) throw Object.assign(new Error(data.error || "HTTP ".concat(res.status)), {
        status: res.status,
        data
    });
    return data;
}
const auth = {
    register: (body)=>request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(body)
        }),
    login: (body)=>request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(body)
        }),
    me: ()=>request('/auth/me'),
    updateMe: (body)=>request('/auth/me', {
            method: 'PATCH',
            body: JSON.stringify(body)
        })
};
const providers = {
    list: function() {
        let params = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        const q = new URLSearchParams(params).toString();
        return request("/providers".concat(q ? "?".concat(q) : ''));
    },
    get: (id)=>request("/providers/".concat(id)),
    myProfile: ()=>request('/providers/me/profile'),
    create: (body)=>request('/providers', {
            method: 'POST',
            body: JSON.stringify(body)
        }),
    update: (id, body)=>request("/providers/".concat(id), {
            method: 'PUT',
            body: JSON.stringify(body)
        }),
    delete: (id)=>request("/providers/".concat(id), {
            method: 'DELETE'
        })
};
const menu = {
    list: (providerId)=>request("/providers/".concat(providerId, "/menu")),
    add: (providerId, body)=>request("/providers/".concat(providerId, "/menu"), {
            method: 'POST',
            body: JSON.stringify(body)
        }),
    update: (id, body)=>request("/menu/".concat(id), {
            method: 'PUT',
            body: JSON.stringify(body)
        }),
    delete: (id)=>request("/menu/".concat(id), {
            method: 'DELETE'
        })
};
const orders = {
    list: ()=>request('/orders'),
    get: (id)=>request("/orders/".concat(id)),
    create: (body)=>request('/orders', {
            method: 'POST',
            body: JSON.stringify(body)
        }),
    updateStatus: (id, status)=>request("/orders/".concat(id, "/status"), {
            method: 'PUT',
            body: JSON.stringify({
                status
            })
        })
};
const upload = {
    file: async function(file) {
        let folder = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'moms-magic';
        const form = new FormData();
        form.append('file', file);
        form.append('folder', folder);
        const res = await fetch("".concat(BASE, "/upload"), {
            method: 'POST',
            headers: authHeaders(),
            body: form
        });
        const data = await res.json().catch(()=>({}));
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        return data;
    },
    deleteAsset: (id)=>request("/upload/".concat(id), {
            method: 'DELETE'
        })
};
const admin = {
    login: (body)=>request('/admin/login', {
            method: 'POST',
            body: JSON.stringify(body)
        }),
    data: ()=>request('/admin/data')
};
function imgUrl(fileKey) {
    let transforms = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : '';
    if (!fileKey) return null;
    if (fileKey.startsWith('http')) return fileKey;
    return "".concat(OPENINARY, "/file/").concat(transforms ? transforms + '/' : '').concat(fileKey);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/project/context/AuthContext.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/project/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/project/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/project/lib/api.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function AuthProvider(param) {
    let { children } = param;
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            const adminToken = localStorage.getItem('mm_admin_token');
            const userToken = localStorage.getItem('mm_token');
            const token = adminToken || userToken;
            if (!token) {
                setLoading(false);
                return;
            }
            const fetchMe = {
                "AuthProvider.useEffect.fetchMe": async ()=>{
                    try {
                        const prevToken = localStorage.getItem('mm_token');
                        if (adminToken) {
                            // Temporarily use admin token for /api/auth/me
                            localStorage.setItem('mm_token', adminToken);
                        }
                        const { user } = await __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"].me();
                        setUser(user);
                    } catch (err) {
                        if (adminToken) localStorage.removeItem('mm_admin_token');
                        else localStorage.removeItem('mm_token');
                        setUser(null);
                    } finally{
                        if (adminToken && userToken) {
                            localStorage.setItem('mm_token', userToken);
                        } else if (adminToken) {
                            localStorage.removeItem('mm_token');
                        }
                        setLoading(false);
                    }
                }
            }["AuthProvider.useEffect.fetchMe"];
            fetchMe();
        }
    }["AuthProvider.useEffect"], []);
    const login = (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[login]": async (email, password)=>{
            const { token, user } = await __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"].login({
                email,
                password
            });
            localStorage.setItem('mm_token', token);
            setUser(user);
            return user;
        }
    }["AuthProvider.useCallback[login]"], []);
    const register = (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[register]": async (body)=>{
            const { token, user } = await __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"].register(body);
            localStorage.setItem('mm_token', token);
            setUser(user);
            return user;
        }
    }["AuthProvider.useCallback[register]"], []);
    const logout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[logout]": ()=>{
            localStorage.removeItem('mm_token');
            setUser(null);
        }
    }["AuthProvider.useCallback[logout]"], []);
    const updateUser = (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[updateUser]": (updated)=>setUser(updated)
    }["AuthProvider.useCallback[updateUser]"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            loading,
            login,
            register,
            logout,
            updateUser
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/project/context/AuthContext.jsx",
        lineNumber: 68,
        columnNumber: 5
    }, this);
}
_s(AuthProvider, "ACDBEQIhVhH+XvDLbzQVd/mRy5g=");
_c = AuthProvider;
function useAuth() {
    _s1();
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
_s1(useAuth, "/dMy7t63NXD4eYACoT93CePwGrg=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/project/components/BottomNav.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BottomNav
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/project/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/project/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/project/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__ = __turbopack_context__.i("[project]/project/node_modules/lucide-react/dist/esm/icons/house.js [app-client] (ecmascript) <export default as Home>");
var __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/project/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__ = __turbopack_context__.i("[project]/project/node_modules/lucide-react/dist/esm/icons/shopping-bag.js [app-client] (ecmascript) <export default as ShoppingBag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/project/node_modules/lucide-react/dist/esm/icons/user.js [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__ = __turbopack_context__.i("[project]/project/node_modules/lucide-react/dist/esm/icons/layout-dashboard.js [app-client] (ecmascript) <export default as LayoutDashboard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/project/context/AuthContext.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function BottomNav() {
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const tabs = [
        {
            href: '/',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__["Home"],
            label: 'Home'
        },
        {
            href: '/?search=1',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"],
            label: 'Search',
            isSearch: true
        },
        ...(user === null || user === void 0 ? void 0 : user.role) === 'customer' ? [
            {
                href: '/orders',
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__["ShoppingBag"],
                label: 'Orders'
            }
        ] : [],
        ...(user === null || user === void 0 ? void 0 : user.role) === 'provider' || (user === null || user === void 0 ? void 0 : user.role) === 'admin' ? [
            {
                href: '/dashboard',
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"],
                label: 'Dashboard'
            }
        ] : [],
        {
            href: '/profile',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"],
            label: user ? user.name.split(' ')[0] : 'Log in'
        }
    ];
    function isActive(tab) {
        if (tab.isSearch) return false;
        if (tab.href === '/') return pathname === '/';
        return pathname.startsWith(tab.href);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        className: "md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#FCEAE1]",
        style: {
            paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        },
        "aria-label": "Bottom navigation",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-stretch justify-around h-14",
            children: tabs.map((tab)=>{
                const active = isActive(tab);
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: tab.href,
                    className: "flex flex-col items-center justify-center flex-1 gap-0.5 text-[10px] font-semibold transition-colors min-w-0 relative ".concat(active ? 'text-[#EA580C]' : 'text-[#64748B]'),
                    "aria-current": active ? 'page' : undefined,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(tab.icon, {
                            size: 20,
                            strokeWidth: active ? 2.5 : 1.8,
                            "aria-hidden": "true"
                        }, void 0, false, {
                            fileName: "[project]/project/components/BottomNav.jsx",
                            lineNumber: 41,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "truncate max-w-[50px] text-center",
                            children: tab.label
                        }, void 0, false, {
                            fileName: "[project]/project/components/BottomNav.jsx",
                            lineNumber: 42,
                            columnNumber: 15
                        }, this),
                        active && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#EA580C] rounded-full",
                            "aria-hidden": "true"
                        }, void 0, false, {
                            fileName: "[project]/project/components/BottomNav.jsx",
                            lineNumber: 43,
                            columnNumber: 26
                        }, this)
                    ]
                }, tab.label, true, {
                    fileName: "[project]/project/components/BottomNav.jsx",
                    lineNumber: 38,
                    columnNumber: 13
                }, this);
            })
        }, void 0, false, {
            fileName: "[project]/project/components/BottomNav.jsx",
            lineNumber: 34,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/project/components/BottomNav.jsx",
        lineNumber: 31,
        columnNumber: 5
    }, this);
}
_s(BottomNav, "DHgmXk9pjP30GK1K2RUkpFmH5Fw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = BottomNav;
var _c;
__turbopack_context__.k.register(_c, "BottomNav");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/project/hooks/useInstallPrompt.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useInstallPrompt",
    ()=>useInstallPrompt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/project/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
const DISMISS_KEY = 'mm_pwa_dismiss_until';
const INSTALLED_KEY = 'mm_pwa_installed';
function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}
function useInstallPrompt() {
    _s();
    const [deferredPrompt, setDeferredPrompt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showBanner, setShowBanner] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [installed, setInstalled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useInstallPrompt.useEffect": ()=>{
            if (isStandalone() || localStorage.getItem(INSTALLED_KEY)) {
                setInstalled(true);
                return;
            }
            const until = Number(localStorage.getItem(DISMISS_KEY) || 0);
            if (Date.now() < until) return;
            const onPrompt = {
                "useInstallPrompt.useEffect.onPrompt": (e)=>{
                    e.preventDefault();
                    setDeferredPrompt(e);
                    setShowBanner(true);
                }
            }["useInstallPrompt.useEffect.onPrompt"];
            const onInstalled = {
                "useInstallPrompt.useEffect.onInstalled": ()=>{
                    setInstalled(true);
                    setShowBanner(false);
                    localStorage.setItem(INSTALLED_KEY, 'true');
                }
            }["useInstallPrompt.useEffect.onInstalled"];
            window.addEventListener('beforeinstallprompt', onPrompt);
            window.addEventListener('appinstalled', onInstalled);
            return ({
                "useInstallPrompt.useEffect": ()=>{
                    window.removeEventListener('beforeinstallprompt', onPrompt);
                    window.removeEventListener('appinstalled', onInstalled);
                }
            })["useInstallPrompt.useEffect"];
        }
    }["useInstallPrompt.useEffect"], []);
    async function install() {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setInstalled(true);
            setShowBanner(false);
            localStorage.setItem(INSTALLED_KEY, 'true');
        }
        setDeferredPrompt(null);
    }
    function dismiss() {
        setShowBanner(false);
        localStorage.setItem(DISMISS_KEY, String(Date.now() + 3 * 24 * 60 * 60 * 1000));
    }
    return {
        showBanner,
        installed,
        install,
        dismiss
    };
}
_s(useInstallPrompt, "7X021Ym4RXCZys3wmMKoKJGsK+k=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/project/components/InstallBanner.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>InstallBanner
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/project/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chef$2d$hat$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChefHat$3e$__ = __turbopack_context__.i("[project]/project/node_modules/lucide-react/dist/esm/icons/chef-hat.js [app-client] (ecmascript) <export default as ChefHat>");
var __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/project/node_modules/lucide-react/dist/esm/icons/download.js [app-client] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/project/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$hooks$2f$useInstallPrompt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/project/hooks/useInstallPrompt.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function InstallBanner() {
    _s();
    const { showBanner, installed, install, dismiss } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$hooks$2f$useInstallPrompt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInstallPrompt"])();
    if (!showBanner || installed) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed bottom-[env(safe-area-inset-bottom,0px)] left-0 right-0 z-50 mx-3 mb-3 sm:mx-auto sm:max-w-md",
        role: "complementary",
        "aria-label": "Install app prompt",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white border border-[#FCEAE1] rounded-2xl shadow-xl px-4 py-3.5 flex items-center gap-3",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-11 h-11 bg-[#EA580C] rounded-xl flex items-center justify-center shrink-0",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chef$2d$hat$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChefHat$3e$__["ChefHat"], {
                        size: 22,
                        color: "white",
                        "aria-hidden": "true"
                    }, void 0, false, {
                        fileName: "[project]/project/components/InstallBanner.jsx",
                        lineNumber: 19,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/project/components/InstallBanner.jsx",
                    lineNumber: 18,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 min-w-0",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm font-bold text-[#0F172A] leading-tight",
                            children: "Install Mom's Magic"
                        }, void 0, false, {
                            fileName: "[project]/project/components/InstallBanner.jsx",
                            lineNumber: 22,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-[#64748B] mt-0.5",
                            children: "Add to home screen for the full app experience"
                        }, void 0, false, {
                            fileName: "[project]/project/components/InstallBanner.jsx",
                            lineNumber: 23,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/project/components/InstallBanner.jsx",
                    lineNumber: 21,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2 shrink-0",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: install,
                            className: "flex items-center gap-1.5 bg-[#EA580C] text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-[#C2410C] active:scale-95 transition-all cursor-pointer",
                            "aria-label": "Install app",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                    size: 13,
                                    "aria-hidden": "true"
                                }, void 0, false, {
                                    fileName: "[project]/project/components/InstallBanner.jsx",
                                    lineNumber: 31,
                                    columnNumber: 13
                                }, this),
                                "Install"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/project/components/InstallBanner.jsx",
                            lineNumber: 26,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: dismiss,
                            className: "p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#FDF4F0] rounded-lg transition-colors cursor-pointer",
                            "aria-label": "Dismiss install prompt",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                size: 16
                            }, void 0, false, {
                                fileName: "[project]/project/components/InstallBanner.jsx",
                                lineNumber: 39,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/project/components/InstallBanner.jsx",
                            lineNumber: 34,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/project/components/InstallBanner.jsx",
                    lineNumber: 25,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/project/components/InstallBanner.jsx",
            lineNumber: 17,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/project/components/InstallBanner.jsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
_s(InstallBanner, "+epXUkN4xoTHrO22JGGQtFbw6IU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$hooks$2f$useInstallPrompt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInstallPrompt"]
    ];
});
_c = InstallBanner;
var _c;
__turbopack_context__.k.register(_c, "InstallBanner");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=project_baf5799d._.js.map