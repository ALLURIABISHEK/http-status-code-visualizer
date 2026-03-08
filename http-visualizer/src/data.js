export const nodes = [
    { id: 'client', label: 'Client', col: 0, row: 0 },
    { id: 'dns', label: 'DNS Resolver', col: 1, row: 0 },
    { id: 'cdn', label: 'CDN / Edge', col: 2, row: 0 },
    { id: 'lb', label: 'Load Balancer', col: 3, row: 0 },
    { id: 'gateway', label: 'API Gateway', col: 3, row: 1 },
    { id: 'auth', label: 'Authentication', col: 2, row: 1 },
    { id: 'authz', label: 'Authorization', col: 1, row: 1 },
    { id: 'rate', label: 'Rate Limit', col: 0, row: 1 },
    { id: 'val', label: 'Req Validation', col: 0, row: 2 },
    { id: 'route', label: 'Routing', col: 1, row: 2 },
    { id: 'service', label: 'Microservice', col: 2, row: 2 },
    { id: 'db', label: 'DB / Cache', col: 3, row: 2 },
    { id: 'response', label: 'Response', col: 3, row: 3 },
];

export const statuses = [
    { code: 200, label: 'Success' },
    { code: 401, label: 'No Identity' },
    { code: 403, label: 'No Access' },
    { code: 404, label: 'Missing' },
    { code: 422, label: 'Bad Data' },
    { code: 429, label: 'Spam/Limit' },
    { code: 500, label: 'Code Crash' },
    { code: 502, label: 'Network' },
    { code: 503, label: 'Overload' },
];

export const statusConfig = {
    200: {
        failNode: null,
        explanation: {
            title: "200 Success: Mission Accomplished",
            meaning: "The request travelled through the entire pipeline, passed security, validation, and rate-limiting checks, and received a valid answer from the core service. This is the ideal 'happy path' for every web interaction.",
            reasons: [
                "The client provided perfect credentials and headers",
                "The server-side business logic executed without errors",
                "Data was successfully fetched or updated in the persistent database",
                "The response was generated and compressed within acceptable latency limits"
            ],
            fix: [
                "Keep building! Your integration and environment are stable.",
                "Consider monitoring performance to ensure '200' responses remain fast."
            ],
            example: "The moment you click 'Like' and the heart immediately turns red without any spinning or error popups."
        },
        logs: [
            { node: 'gateway', msg: 'Request received' },
            { node: 'auth', msg: 'Token valid' },
            { node: 'authz', msg: 'Permissions verified' },
            { node: 'rate', msg: 'Under rate limit' },
            { node: 'val', msg: 'Payload validated' },
            { node: 'route', msg: 'Forwarding to service' },
            { node: 'service', msg: 'Processing request' },
            { node: 'db', msg: 'Data retrieved' },
            { node: 'response', msg: '200 OK sent' },
        ]
    },
    401: {
        failNode: 'auth',
        explanation: {
            title: "401 Unauthorized: Who are you?",
            meaning: "The server requires you to prove your identity before it can process the request. This is the first gate of the security pipeline where we check if the visitor is a 'Known User'.",
            reasons: [
                "No 'Authorization' header was sent with the request",
                "The token provided is malformed or signature check failed",
                "Your session has expired and the refresh token is also invalid",
                "The user account has been disabled or deleted from the identity provider"
            ],
            fix: [
                "Log in again to generate a fresh JWT or Session cookie",
                "Check if you forgot to add the 'Bearer' prefix in your code",
                "Verify that your clock is synced; expired timestamps can trigger this error"
            ],
            example: "Trying to see your private Instagram DMs while you are logged out. The app needs to know it's really you."
        },
        logs: [
            { node: 'gateway', msg: 'Request received' },
            { node: 'auth', msg: 'Checking token' },
            { node: 'auth', msg: 'Token missing or invalid. Rejecting.', type: 'error' },
        ]
    },
    403: {
        failNode: 'authz',
        explanation: {
            title: "403 Forbidden: No Entry",
            meaning: "The server knows who you are, but you are not allowed to touch this specific resource. Unlike a 401 where we don't know who you are, here we know you—but we've decided your 'Permissions' aren't enough.",
            reasons: [
                "User is logged in but doesn't have the required 'Admin' or 'Manager' role",
                "The specific resource (like a private file) is owned by a different user",
                "Your IP address has been flagged or blocked by the firewall",
                "The server is protecting sensitive system files that should never be public"
            ],
            fix: [
                "Request elevated permissions from a system administrator",
                "Ensure your token includes the necessary 'Scopes' or 'Roles'",
                "Check the backend 'Access Control List' (ACL) for this resource"
            ],
            example: "A regular bank customer trying to use the 'Withdraw' button on someone else's savings account."
        },
        logs: [
            { node: 'gateway', msg: 'Request received' },
            { node: 'auth', msg: 'Token valid' },
            { node: 'authz', msg: 'Checking permissions' },
            { node: 'authz', msg: 'Permission denied. Rejecting.', type: 'error' },
        ]
    },
    404: {
        failNode: 'route',
        explanation: {
            title: "404 Not Found: Dead End",
            meaning: "The server couldn't find anything at the address you provided. This often means the 'Pipeline' reached the end of its map and didn't find any 'Routing' instructions for your specific URL.",
            reasons: [
                "Typing errors in the URL (e.g., /dashboard becoming /dashbord)",
                "The resource (a post, user, or file) was recently deleted",
                "The API version you are calling has been deprecated and removed",
                "The server-side routing table is missing an entry for this path"
            ],
            fix: [
                "Verify the URL spelling against the official API documentation",
                "Check if you are using the correct environment (Staging vs. Production)",
                "Implement 404 monitoring to find and fix broken links in your app"
            ],
            example: "Typing gogle.com/setting-panel when the real page is just /settings. The server just says 'I don't know what that is'."
        },
        logs: [
            { node: 'gateway', msg: 'Request received' },
            { node: 'auth', msg: 'Token valid' },
            { node: 'authz', msg: 'Permissions verified' },
            { node: 'rate', msg: 'Under rate limit' },
            { node: 'val', msg: 'Payload validated' },
            { node: 'route', msg: 'Locating service endpoint' },
            { node: 'route', msg: 'No matching route found.', type: 'error' },
        ]
    },
    422: {
        failNode: 'val',
        explanation: {
            title: "422 Unprocessable: Bad Formatting",
            meaning: "The server reached your request, but the data inside it doesn't make sense for the code to handle. The 'Envelope' is fine, but the 'Letter' inside is written in a way the server doesn't understand.",
            reasons: [
                "Sending alphabetic characters in a field that only accepts numbers",
                "A required field, like 'email', was left empty in the JSON body",
                "The password provided is too short or lacks special characters",
                "A logic error, like trying to pick a delivery date in the past"
            ],
            fix: [
                "Validate user input on the browser/mobile side BEFORE sending the request",
                "Use a strict 'Schema Validator' like Zod or Joi to catch these errors",
                "Provide clear, localized error messages to the user about which field failed"
            ],
            example: "Trying to create a new account but leaving the 'Email' field blank. The server stops and says 'I need this to continue'."
        },
        logs: [
            { node: 'gateway', msg: 'Request received' },
            { node: 'auth', msg: 'Token valid' },
            { node: 'authz', msg: 'Permissions verified' },
            { node: 'rate', msg: 'Under rate limit' },
            { node: 'val', msg: 'Validating payload' },
            { node: 'val', msg: 'Schema validation failed.', type: 'error' },
        ]
    },
    429: {
        failNode: 'rate',
        explanation: {
            title: "429 Too Many Requests: Slow Down",
            meaning: "You are sending requests faster than the server is allowed to process them. This is a safety mechanism to prevent one single user or bot from crashing the entire system for everyone else.",
            reasons: [
                "Hitting the 'Refresh' button too many times per second",
                "A background script or 'Cron job' is calling the API in a rapid loop",
                "Your IP address is part of an automated 'Brute Force' attack",
                "Exceeded the requests-per-month limit on your free API plan"
            ],
            fix: [
                "Implement 'Exponential Backoff' (wait 1s, then 2s, then 4s before retrying)",
                "Add a loading state to your buttons so users can't click them 10 times",
                "Cache data locally so you don't have to keep asking the server for it"
            ],
            example: "A bot trying to guess your password by trying every possible combination at lightning speed."
        },
        logs: [
            { node: 'gateway', msg: 'Request received' },
            { node: 'auth', msg: 'Token valid' },
            { node: 'authz', msg: 'Permissions verified' },
            { node: 'rate', msg: 'Checking rate limits' },
            { node: 'rate', msg: 'Limit exceeded.', type: 'error' },
        ]
    },
    500: {
        failNode: 'service',
        explanation: {
            title: "500 Internal Error: Unexpected Crash",
            meaning: "The server's internal code encountered a problem and just 'died'. This is the most frustrating error because it doesn't tell the user exactly what went wrong—it's a generic catch-all for 'The code broke'.",
            reasons: [
                "A programmer forgot to handle a 'Null' value in the code",
                "The server's Hard Drive or RAM is completely full",
                "A critical database or third-party service is unreachable",
                "Configuration variables (like API Keys) are missing or incorrect"
            ],
            fix: [
                "Check the backend error logs (Stdout/CloudWatch) immediately",
                "Implement 'Error Tracking' (like Sentry) to get automated crash reports",
                "Ensure that your server has enough resources (CPU/RAM) to operate"
            ],
            example: "The entire website turns white or shows a 'Please contact support' screen the moment you click 'Buy Now'."
        },
        logs: [
            { node: 'gateway', msg: 'Request received' },
            { node: 'auth', msg: 'Token valid' },
            { node: 'authz', msg: 'Permissions verified' },
            { node: 'rate', msg: 'Under rate limit' },
            { node: 'val', msg: 'Payload validated' },
            { node: 'route', msg: 'Forwarding to service' },
            { node: 'service', msg: 'Exec code...' },
            { node: 'service', msg: 'Unhandled Exception! Crash.', type: 'error' },
        ]
    },
    502: {
        failNode: 'service',
        explanation: {
            title: "502 Bad Gateway: Connection Lost",
            meaning: "The Gateway (the front door) tried to talk to the Microservice (the kitchen), but the kitchen didn't answer properly. The 'Gateway' is functioning fine, but its partner deeper in the network is failing.",
            reasons: [
                "The target microservice is in the middle of a 'Restart' or 'Crashed'",
                "A network firewall is blocking the connection between internal services",
                "The microservice is overloaded and timed out before giving an answer",
                "The service returned a malformed response that the Gateway didn't expect"
            ],
            fix: [
                "Verify the Health Check of each individual backend microservice",
                "Check the 'Proxy' settings to ensure the Gateway can find the service",
                "Examine the network latency within your cluster or data center"
            ],
            example: "A waiter goes into the kitchen to place your order, but finds the chefs are all arguing and haven't started cooking anything yet."
        },
        logs: [
            { node: 'gateway', msg: 'Request received' },
            { node: 'auth', msg: 'Token valid' },
            { node: 'authz', msg: 'Permissions verified' },
            { node: 'rate', msg: 'Under rate limit' },
            { node: 'val', msg: 'Payload validated' },
            { node: 'route', msg: 'Forwarding to service' },
            { node: 'service', msg: 'Upstream connection error.', type: 'error' },
        ]
    },
    503: {
        failNode: 'lb',
        explanation: {
            title: "503 Unavailable: Busy / Maintenance",
            meaning: "The server is too busy or is currently being updated and intentionally decided not to take any more users. It's not a 'Crash' (like 500) but a 'We are full right now' message.",
            reasons: [
                "The server is performing a scheduled software update or maintenance",
                "A massive traffic spike (like a Ticketmaster sale) is overwhelming the app",
                "The system is cooling down or performing a resource-heavy backup",
                "Too many users are trying to access the same resource at once"
            ],
            fix: [
                "Wait 1 minute and refresh the page (the 'Retry-After' strategy)",
                "Add more 'Server Instances' (Auto-scaling) to handle the traffic spike",
                "Use a CDN to serve 'Static' versions of the page to reduce server load"
            ],
            example: "A storefront that says 'We will be back soon! We are updating our stock' during a popular product launch."
        },
        logs: [
            { node: 'gateway', msg: 'Request received' },
            { node: 'lb', msg: 'Checking downstream health' },
            { node: 'lb', msg: 'No healthy instances available.', type: 'error' },
        ]
    }
};
