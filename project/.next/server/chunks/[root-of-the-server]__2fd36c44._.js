module.exports = [
"[project]/project/.next-internal/server/app/api/auth/me/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/pg [external] (pg, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("pg");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/project/lib/db.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "query",
    ()=>query
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const { Pool } = __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__["default"];
// Singleton pool — prevents too many connections during Next.js hot reloads
if (!/*TURBOPACK member replacement*/ __turbopack_context__.g._pgPool) {
    /*TURBOPACK member replacement*/ __turbopack_context__.g._pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000
    });
    /*TURBOPACK member replacement*/ __turbopack_context__.g._pgPool.on('error', (err)=>{
        console.error('PostgreSQL pool error:', err);
    });
}
if (!/*TURBOPACK member replacement*/ __turbopack_context__.g._pgPool.options.connectionString) {
    console.error('DATABASE_URL is not set. Please set process.env.DATABASE_URL to your Postgres connection string (e.g., postgres://user:pass@localhost:5432/dbname)');
}
const pool = /*TURBOPACK member replacement*/ __turbopack_context__.g._pgPool;
const query = async (text, params)=>{
    try {
        return await pool.query(text, params);
    } catch (error) {
        console.error('Database query failed:', error);
        throw error;
    }
};
const __TURBOPACK__default__export__ = pool;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/project/lib/auth.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkRole",
    ()=>checkRole,
    "err",
    ()=>err,
    "getAuth",
    ()=>getAuth,
    "safeUser",
    ()=>safeUser,
    "signToken",
    ()=>signToken,
    "verifyToken",
    ()=>verifyToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/project/node_modules/jsonwebtoken/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/project/node_modules/next/server.js [app-route] (ecmascript)");
;
;
function signToken(user) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].sign({
        sub: user.id,
        role: user.role
    }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
}
function verifyToken(request) {
    const header = request.headers.get('authorization');
    if (!header?.startsWith('Bearer ')) return null;
    try {
        return __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].verify(header.slice(7), process.env.JWT_SECRET);
    } catch  {
        return null;
    }
}
function getAuth(request) {
    const payload = verifyToken(request);
    if (!payload) return {
        payload: null,
        unauth: __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Unauthorised'
        }, {
            status: 401
        })
    };
    return {
        payload,
        unauth: null
    };
}
function checkRole(payload, ...roles) {
    if (!roles.includes(payload.role)) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Forbidden'
        }, {
            status: 403
        });
    }
    return null;
}
function safeUser(user) {
    const { password_hash, ...rest } = user;
    return rest;
}
function err(msg, status = 500) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: msg
    }, {
        status
    });
}
}),
"[project]/project/app/api/auth/me/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "PATCH",
    ()=>PATCH
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/project/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/project/lib/db.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/project/lib/auth.js [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function GET(request) {
    const { payload, unauth } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuth"])(request);
    if (unauth) return unauth;
    if (payload.role === 'admin') {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        return __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            user: {
                id: 'admin',
                name: 'Admin',
                email: adminEmail,
                role: 'admin'
            }
        });
    }
    try {
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM users WHERE id = $1', [
            payload.sub
        ]);
        if (!result.rows.length) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["err"])('User not found', 404);
        return __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            user: (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safeUser"])(result.rows[0])
        });
    } catch (e) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["err"])(e.message);
    }
}
async function PATCH(request) {
    const { payload, unauth } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuth"])(request);
    if (unauth) return unauth;
    try {
        const { name, phone, avatar_url, current_password, new_password } = await request.json();
        // Password change flow
        if (new_password) {
            const userRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM users WHERE id = $1', [
                payload.sub
            ]);
            const user = userRes.rows[0];
            const bcrypt = (await __turbopack_context__.A("[project]/project/node_modules/bcryptjs/index.js [app-route] (ecmascript, async loader)")).default;
            if (!await bcrypt.compare(current_password || '', user.password_hash)) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["err"])('Current password is incorrect', 400);
            const password_hash = await bcrypt.hash(new_password, 12);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('UPDATE users SET password_hash = $1 WHERE id = $2', [
                password_hash,
                payload.sub
            ]);
            return __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true
            });
        }
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`UPDATE users SET
        name       = COALESCE($1, name),
        phone      = COALESCE($2, phone),
        avatar_url = COALESCE($3, avatar_url)
       WHERE id = $4 RETURNING *`, [
            name || null,
            phone || null,
            avatar_url || null,
            payload.sub
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            user: (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safeUser"])(result.rows[0])
        });
    } catch (e) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["err"])(e.message);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__2fd36c44._.js.map