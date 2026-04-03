module.exports = [
"[project]/project/.next-internal/server/app/api/providers/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[project]/project/app/api/providers/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
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
    try {
        const { searchParams } = new URL(request.url);
        const city = searchParams.get('city');
        const search = searchParams.get('search');
        const veg = searchParams.get('veg');
        const nonveg = searchParams.get('nonveg');
        const conditions = [
            'p.is_active = TRUE'
        ];
        const params = [];
        if (city) {
            params.push(`%${city}%`);
            conditions.push(`p.city ILIKE $${params.length}`);
        }
        if (search) {
            params.push(`%${search}%`);
            conditions.push(`(p.kitchen_name ILIKE $${params.length} OR p.location ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
        }
        if (veg === 'true') conditions.push('p.is_veg = TRUE');
        if (nonveg === 'true') conditions.push('p.is_nonveg = TRUE');
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT p.*, u.name AS owner_name, u.email AS owner_email
       FROM providers p JOIN users u ON u.id = p.user_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY p.rating DESC, p.total_orders DESC`, params);
        return __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            providers: result.rows
        });
    } catch (e) {
        console.error('GET /api/providers failed:', e);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["err"])(e?.message || String(e) || 'Unexpected error', 500);
    }
}
async function POST(request) {
    const { payload, unauth } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuth"])(request);
    if (unauth) return unauth;
    const roleErr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkRole"])(payload, 'provider', 'admin');
    if (roleErr) return roleErr;
    try {
        const body = await request.json();
        const { kitchen_name, description, location, city, address, phone, cover_image_url, cover_image_id, is_veg, is_nonveg, price_from, delivery_time } = body;
        if (!kitchen_name || !location) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["err"])('kitchen_name and location are required', 400);
        const existing = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('SELECT id FROM providers WHERE user_id = $1', [
            payload.sub
        ]);
        if (existing.rows.length) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["err"])('You already have a kitchen profile. Use PUT to update it.', 409);
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`INSERT INTO providers
        (user_id, kitchen_name, description, location, city, address, phone,
         cover_image_url, cover_image_id, is_veg, is_nonveg, price_from, delivery_time)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`, [
            payload.sub,
            kitchen_name,
            description || null,
            location,
            city || 'Kolkata',
            address || null,
            phone || null,
            cover_image_url || null,
            cover_image_id || null,
            is_veg === true || is_veg === 'true',
            is_nonveg === true || is_nonveg === 'true',
            price_from || 60,
            delivery_time || null
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            provider: result.rows[0]
        }, {
            status: 201
        });
    } catch (e) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$project$2f$lib$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["err"])(e.message);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1af132fe._.js.map