# API reference

Responses are `{success:true,data}` or `{success:false,error:{code,message,requestId}}`. Paginated lists include `pagination:{page,pageSize,total}`. Collection sizes are limited to 200 per page. API data is uncached at the HTTP layer.

Sessions use an HttpOnly SameSite=Strict cookie. Login/me return a CSRF token; authenticated mutations require `X-CSRF-Token`. Production sets Secure cookies. POST/PATCH/DELETE must originate from APP_ORIGIN when an Origin header is supplied.

| Route | Access / function |
|---|---|
| POST /api/auth/login | Email and password |
| GET /api/auth/me; POST /api/auth/logout | Session |
| PATCH /api/auth/profile | Own name; current/new password |
| GET /api/state | Shared model with role-filtered report evidence |
| GET /api/villages; GET/PATCH /api/villages/:id | Read; admin update |
| GET /api/wards; PATCH /api/wards/:id | Read; admin update demographics |
| GET/POST /api/assets; GET/PATCH/DELETE /api/assets/:id | Authenticated read; admin CRUD |
| GET /api/villages/:id/assets | Asset list |
| GET/POST /api/dependencies; PATCH/DELETE /api/dependencies/:id | Read; admin mutations |
| GET/POST /api/reports; PATCH/DELETE /api/reports/:id | Own/assigned/admin visibility; admin delete |
| POST /api/uploads; GET /api/uploads/:id | Raw JPEG/PNG/WebP up to 8 MB; private serving |
| GET/POST /api/incidents; PATCH /api/incidents/:id | Officer/admin |
| GET/POST /api/interventions; PATCH /api/interventions/:id | Admin |
| GET/POST /api/users; PATCH /api/users/:id | Admin create/edit/disable/revoke |
| GET /api/trace/:id | Directed impact trace |
| POST /api/simulations/failure; POST /api/rice/analyze | Admin; scenario, assetIds, rain, apply |
| DELETE /api/simulations/active | Admin; clear saved overlay |
| POST /api/simulations/what-if | Admin; rain, population, assetId, condition, capacity; optional newFacility/relocate |
| GET /api/simulations | Admin; saved runs and plans |
| GET /api/priorities | Sorted computed asset scores |
| POST /api/budget/optimize | Admin; budget (lakhs), minProjects, maxProjects, minimumPriority, ward, category, strategy |
| GET /api/analytics/pulse; GET /api/analytics/dashboard | Computed metrics |
| PATCH /api/settings/weights | Admin; condition/population/service/accessibility/hazard/evidence weights |
| GET /api/search?q= | Role-filtered entity search |
| GET /api/audit | Admin paginated audit events |
| GET /api/notifications; POST /api/notifications/:id/read | Event notifications and per-user read state |
| POST /api/demo/reports; POST /api/demo/reset | Admin; generated demonstration changes |
| GET /api/export | Admin snapshot export |

Schemas and field limits are defined in shared/models.ts and server/app.ts. API requests reject unknown fields. Foreign-key conflicts return 409 rather than orphaning histories. Asset mutation costs and planning budgets are expressed in ₹ lakh; the optimizer converts to integer rupees.
