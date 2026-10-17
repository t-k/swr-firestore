export const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }
    function valid(data) { return data.score is int && data.score >= 0 && data.score <= 10; }
    match /items/{id} {
      allow read: if signedIn() && (resource.data.owner == request.auth.uid || request.auth.token.admin == true);
      allow create: if signedIn() && request.resource.data.owner == request.auth.uid && valid(request.resource.data);
      allow update: if signedIn() && resource.data.owner == request.auth.uid && request.resource.data.owner == resource.data.owner && valid(request.resource.data);
      allow delete: if signedIn() && (resource.data.owner == request.auth.uid || request.auth.token.admin == true);
    }
  }
}`;

const mutations = [
  ["deny-authenticated", "request.auth != null", "false"],
  [
    "invert-owner",
    "resource.data.owner == request.auth.uid",
    "resource.data.owner != request.auth.uid",
  ],
  ["public-read", "allow read: if signedIn()", "allow read: if true || signedIn()"],
  [
    "create-or",
    "signedIn() && request.resource.data.owner == request.auth.uid",
    "signedIn() || request.resource.data.owner == request.auth.uid",
  ],
  ["remove-integer-check", "data.score is int", "true"],
  ["exclude-zero", "data.score >= 0", "data.score > 0"],
  ["exclude-ten", "data.score <= 10", "data.score < 10"],
  ["allow-owner-transfer", "request.resource.data.owner == resource.data.owner", "true"],
  ["remove-admin", "request.auth.token.admin == true", "false"],
  ["deny-delete", "allow delete: if signedIn()", "allow delete: if false && signedIn()"],
];

export const variants = [
  { id: "baseline", rules },
  ...mutations.map(([id, from, to]) => {
    if (!rules.includes(from)) throw new Error(`Mutation target missing: ${id}`);
    return { id, rules: rules.replaceAll(from, to) };
  }),
];

export const cases = [
  { id: "owner-get", actor: "alice", op: "get", allowed: true },
  { id: "stranger-get", actor: "bob", op: "get", allowed: false },
  { id: "anonymous-get", actor: null, op: "get", allowed: false },
  { id: "admin-get", actor: "admin", op: "get", allowed: true },
  { id: "owner-filtered-list", actor: "alice", op: "list-own", allowed: true },
  { id: "unfiltered-list", actor: "alice", op: "list", allowed: false },
  { id: "anonymous-list", actor: null, op: "list", allowed: false },
  ...[-1, 0, 5, 10, 11, 3.5, "5"].map((score) => ({
    id: `create-score-${typeof score}-${score}`,
    actor: "alice",
    op: "create",
    data: { owner: "alice", score },
    allowed: Number.isInteger(score) && score >= 0 && score <= 10,
  })),
  {
    id: "create-other-owner",
    actor: "alice",
    op: "create",
    data: { owner: "bob", score: 5 },
    allowed: false,
  },
  {
    id: "anonymous-create",
    actor: null,
    op: "create",
    data: { owner: "alice", score: 5 },
    allowed: false,
  },
  { id: "missing-score", actor: "alice", op: "create", data: { owner: "alice" }, allowed: false },
  { id: "owner-update", actor: "alice", op: "update", data: { score: 6 }, allowed: true },
  { id: "invalid-update", actor: "alice", op: "update", data: { score: 11 }, allowed: false },
  { id: "transfer-owner", actor: "alice", op: "update", data: { owner: "bob" }, allowed: false },
  { id: "stranger-update", actor: "bob", op: "update", data: { score: 6 }, allowed: false },
  { id: "owner-delete", actor: "alice", op: "delete", allowed: true },
  { id: "admin-delete", actor: "admin", op: "delete", allowed: true },
  { id: "stranger-delete", actor: "bob", op: "delete", allowed: false },
  { id: "anonymous-delete", actor: null, op: "delete", allowed: false },
];
