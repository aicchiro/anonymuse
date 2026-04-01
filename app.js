const ACCOUNT_STORAGE_KEY = "anonymuse.accounts";
const SESSION_STORAGE_KEY = "anonymuse.session";
const POST_STORAGE_KEY = "anonymuse.posts";
const COMMENT_STORAGE_KEY = "anonymuse.comments";
const DISMISSED_NOTIFICATION_STORAGE_KEY = "anonymuse.dismissedNotifications";
const RESPONSE_DRAFT_STORAGE_KEY = "anonymuse.responseDrafts";
const THEME_STORAGE_KEY = "anonymuse.theme";
const RESPONSE_WORD_LIMIT = 300;
const RESPONSE_DRAFT_AUTOSAVE_DELAY_MS = 350;
const REPORT_DETAIL_MIN_CHARS = 30;
const MEDIA_UPLOAD_LIMIT_BYTES = 4 * 1024 * 1024;
const SUPPORTED_MEDIA_TYPES = new Set(["video", "audio", "image", "gif"]);
const MEDIA_FORMAT_LABELS = {
  video: "One-minute video reflection",
  audio: "One-minute audio reflection",
  image: "Image reflection",
  gif: "GIF reflection"
};
const MEDIA_ACCEPT_TYPES = {
  video: "video/*",
  audio: "audio/*",
  image: "image/*",
  gif: "image/gif,.gif"
};
const RESPONSE_STREAMS = [
  { key: "resonates", label: "Resonates" },
  { key: "pushes_back", label: "Pushes back" },
  { key: "worth_discussing", label: "Worth discussing" }
];
const REPORT_REASON_OPTIONS = [
  { key: "harassment", label: "Harassment or personal attack" },
  { key: "hate", label: "Hate or discriminatory content" },
  { key: "misinformation", label: "Dangerous misinformation" },
  { key: "privacy", label: "Privacy or personal data exposure" },
  { key: "self_harm", label: "Self-harm or unsafe behavior risk" },
  { key: "spam", label: "Spam, promotion, or manipulation" },
  { key: "off_topic", label: "Off-topic or disruptive content" },
  { key: "other", label: "Other serious concern" }
];
const REPORT_URGENCY_OPTIONS = [
  { key: "high", label: "High urgency" },
  { key: "medium", label: "Medium urgency" },
  { key: "low", label: "Low urgency" }
];
const DEFAULT_RESPONSE_TYPE = RESPONSE_STREAMS[0].key;
const THEME_OPTIONS = [
  {
    key: "hearth",
    label: "Hearth",
    description: "Warm parchment surfaces with terracotta accents and an editorial feel."
  },
  {
    key: "tideline",
    label: "Tideline",
    description: "Sea-glass greens and cool stone tones for a calmer, lighter interface."
  },
  {
    key: "nocturne",
    label: "Nocturne",
    description: "Deep ink-blue panels with lantern-gold highlights for a duskier atmosphere."
  }
];
const DEFAULT_THEME = THEME_OPTIONS[0].key;
const LEGACY_DEMO_POST_TITLES = new Set([
  "test",
  "feature idea",
  "welcome to the community"
]);

const seedAccounts = [
  {
    email: "admin@test.com",
    password: "Admin123!",
    role: "admin",
    redirect: "admin.html"
  },
  {
    email: "user@test.com",
    password: "User123!",
    role: "user",
    redirect: "user.html"
  }
];

const seedPosts = [
  {
    id: 103,
    seedKey: "weekly-2026-03-31-main",
    userEmail: "user@test.com",
    title: "What are we protecting when no one names burnout in ministry?",
    content: "This week's reflection sits with the quiet exhaustion that builds when service becomes performance. If everyone looks dependable in public but depleted in private, a ministry can start rewarding disappearance instead of discipleship.",
    format: "One-minute audio reflection",
    whyMatters: "Communities often praise availability without noticing the cost. Honest language around burnout makes care, rest, and sustainable leadership more possible.",
    hopedConversation: "How do we build a culture where people can name exhaustion before resentment hardens?",
    category: "Ministry life",
    sensitivity: "medium",
    declarationAccepted: true,
    status: "approved",
    approvedBy: "admin@test.com",
    createdAt: "2026-03-31T09:00:00.000Z",
    approvedAt: "2026-03-31T09:12:00.000Z"
  },
  {
    id: 2,
    seedKey: "pending-feature-bookmarks",
    userEmail: "user@test.com",
    title: "Feature idea",
    content: "Could we add a bookmarks section for saved content?",
    format: "One-minute video reflection",
    whyMatters: "People may want to revisit thoughtful reflections.",
    hopedConversation: "How can revisit features support deeper reflection over time?",
    category: "Platform",
    sensitivity: "low",
    declarationAccepted: true,
    status: "pending",
    approvedBy: null,
    rejectedBy: null,
    createdAt: "2026-03-24T10:00:00.000Z",
    approvedAt: null,
    rejectedAt: null
  },
  {
    id: 101,
    seedKey: "weekly-2026-03-17-main",
    userEmail: "user@test.com",
    title: "When does certainty stop being honest?",
    content: "This week's reflection asks what happens when confident language leaves no room for repentance, nuance, or lived contradiction. A testimony can sound bold while quietly teaching people that doubt must stay hidden.",
    format: "One-minute video reflection",
    whyMatters: "Communities need language that keeps conviction and humility together.",
    hopedConversation: "How do we speak faithfully without pretending we have no questions?",
    category: "Theology",
    sensitivity: "medium",
    declarationAccepted: true,
    status: "approved",
    approvedBy: "admin@test.com",
    createdAt: "2026-03-17T09:00:00.000Z",
    approvedAt: "2026-03-17T09:20:00.000Z"
  },
  {
    id: 102,
    seedKey: "weekly-2026-03-10-main",
    userEmail: "user@test.com",
    title: "Who gets missed when testimony sounds triumphant?",
    content: "In this week's reflection, we ask who disappears when every testimony has to end in victory. Some people are still in grief, still in treatment, still waiting, and they should not have to translate their pain into a triumph before being believed.",
    format: "One-minute audio reflection",
    whyMatters: "A healthier church culture can witness suffering without rushing to tidy it up.",
    hopedConversation: "What would a testimony sound like if it made room for unresolved grief?",
    category: "Pastoral care",
    sensitivity: "high",
    declarationAccepted: true,
    status: "approved",
    approvedBy: "admin@test.com",
    createdAt: "2026-03-10T09:00:00.000Z",
    approvedAt: "2026-03-10T09:18:00.000Z"
  },
  {
    id: 111,
    seedKey: "weekly-2026-03-31-sub-rest-before-breakdown",
    userEmail: "user@test.com",
    parentPostId: 103,
    sourceCommentId: 201,
    promotedBy: "user@test.com",
    promotedAt: "2026-03-31T13:00:00.000Z",
    title: "What does rest sound like before someone breaks down?",
    content: "This follow-up musing asks how a church can treat early fatigue as something to attend to, not something to spiritualize away. Care usually begins when people are believed before they become a crisis.",
    format: "One-minute audio reflection",
    whyMatters: "Naming tiredness early can protect both leaders and the people they serve.",
    hopedConversation: "What signals tell someone they can speak honestly about limits without being seen as less faithful?",
    category: "Ministry life",
    sensitivity: "medium",
    declarationAccepted: true,
    status: "approved",
    approvedBy: "admin@test.com",
    createdAt: "2026-03-31T12:40:00.000Z",
    approvedAt: "2026-04-01T08:45:00.000Z"
  },
  {
    id: 112,
    seedKey: "weekly-2026-03-17-sub-gentle-correction",
    userEmail: "user@test.com",
    parentPostId: 101,
    sourceCommentId: 204,
    promotedBy: "user@test.com",
    promotedAt: "2026-03-17T15:20:00.000Z",
    title: "What does gentle correction sound like in public?",
    content: "This sub-musing follows the question of certainty into conflict. The issue is not whether correction happens, but whether people leave feeling cornered or accompanied toward truth.",
    format: "One-minute video reflection",
    whyMatters: "Communities reveal their character in how they handle disagreement.",
    hopedConversation: "What makes correction restorative instead of performative?",
    category: "Leadership",
    sensitivity: "medium",
    declarationAccepted: true,
    status: "approved",
    approvedBy: "admin@test.com",
    createdAt: "2026-03-17T15:10:00.000Z",
    approvedAt: "2026-03-18T08:30:00.000Z"
  },
  {
    id: 113,
    seedKey: "weekly-2026-03-10-sub-grief-space",
    userEmail: "user@test.com",
    parentPostId: 102,
    sourceCommentId: 207,
    promotedBy: "user@test.com",
    promotedAt: "2026-03-10T14:20:00.000Z",
    title: "How should testimony make space for grief?",
    content: "This follow-up musing stays with the people still waiting for relief. The invitation is to imagine testimony as witness, not proof that suffering has already been resolved.",
    format: "One-minute audio reflection",
    whyMatters: "Naming grief honestly helps people belong before they are better.",
    hopedConversation: "How can testimony honor God's presence without editing out ongoing pain?",
    category: "Pastoral care",
    sensitivity: "high",
    declarationAccepted: true,
    status: "approved",
    approvedBy: "admin@test.com",
    createdAt: "2026-03-10T14:05:00.000Z",
    approvedAt: "2026-03-11T08:10:00.000Z"
  }
];

const seedComments = [
  {
    id: 1,
    seedKey: "comment-2026-03-31-main-resonates",
    postId: 103,
    userEmail: "user@test.com",
    responseType: "resonates",
    parentResponseId: null,
    content: "This one feels painfully familiar. A lot of people disappear quietly long before anyone asks how they are doing.",
    likedBy: ["user@test.com"],
    resonatedBy: ["user@test.com"],
    discussedBy: ["user@test.com"],
    flaggedBy: [],
    reports: [],
    likeCount: 1,
    resonatesCount: 2,
    discussCount: 1,
    flagCount: 0,
    status: "active",
    createdAt: "2026-03-31T10:30:00.000Z"
  },
  {
    id: 201,
    seedKey: "comment-2026-03-31-main-worth-discussing",
    postId: 103,
    userEmail: "user@test.com",
    responseType: "worth_discussing",
    parentResponseId: null,
    content: "A follow-up on what healthy rest looks like in ministry would help. People often need permission before they ask for it.",
    likedBy: [],
    resonatedBy: [],
    discussedBy: [],
    flaggedBy: [],
    reports: [],
    likeCount: 4,
    resonatesCount: 2,
    discussCount: 5,
    flagCount: 0,
    status: "active",
    createdAt: "2026-03-31T11:05:00.000Z"
  },
  {
    id: 202,
    seedKey: "comment-2026-03-31-main-pushes-back",
    postId: 103,
    userEmail: "user@test.com",
    responseType: "pushes_back",
    parentResponseId: null,
    content: "Some exhaustion is also about boundaries, not only church culture. It would be good to talk about responsibility on both sides.",
    likedBy: [],
    resonatedBy: [],
    discussedBy: [],
    flaggedBy: [],
    reports: [],
    likeCount: 2,
    resonatesCount: 1,
    discussCount: 3,
    flagCount: 0,
    status: "active",
    createdAt: "2026-03-31T11:18:00.000Z"
  },
  {
    id: 203,
    seedKey: "comment-2026-03-17-main-resonates",
    postId: 101,
    userEmail: "user@test.com",
    responseType: "resonates",
    parentResponseId: null,
    content: "Strong language helps some people hold on, but it should not erase the reality of doubt.",
    likedBy: [],
    resonatedBy: [],
    discussedBy: [],
    flaggedBy: [],
    reports: [],
    likeCount: 3,
    resonatesCount: 4,
    discussCount: 2,
    flagCount: 0,
    status: "active",
    createdAt: "2026-03-17T10:12:00.000Z"
  },
  {
    id: 204,
    seedKey: "comment-2026-03-17-main-worth-discussing",
    postId: 101,
    userEmail: "user@test.com",
    responseType: "worth_discussing",
    parentResponseId: null,
    content: "A sub-muse on public correction would be helpful because tone changes everything.",
    likedBy: [],
    resonatedBy: [],
    discussedBy: [],
    flaggedBy: [],
    reports: [],
    likeCount: 2,
    resonatesCount: 2,
    discussCount: 6,
    flagCount: 0,
    status: "active",
    createdAt: "2026-03-17T10:28:00.000Z"
  },
  {
    id: 205,
    seedKey: "comment-2026-03-17-main-pushes-back",
    postId: 101,
    userEmail: "user@test.com",
    responseType: "pushes_back",
    parentResponseId: null,
    content: "I do not mind certainty itself; I mind when certainty becomes untouchable.",
    likedBy: [],
    resonatedBy: [],
    discussedBy: [],
    flaggedBy: [],
    reports: [],
    likeCount: 1,
    resonatesCount: 1,
    discussCount: 2,
    flagCount: 0,
    status: "active",
    createdAt: "2026-03-17T10:41:00.000Z"
  },
  {
    id: 206,
    seedKey: "comment-2026-03-10-main-resonates",
    postId: 102,
    userEmail: "user@test.com",
    responseType: "resonates",
    parentResponseId: null,
    content: "Some testimonies feel impossible to imitate if you are still in the middle of loss.",
    likedBy: [],
    resonatedBy: [],
    discussedBy: [],
    flaggedBy: [],
    reports: [],
    likeCount: 3,
    resonatesCount: 5,
    discussCount: 1,
    flagCount: 0,
    status: "active",
    createdAt: "2026-03-10T10:00:00.000Z"
  },
  {
    id: 207,
    seedKey: "comment-2026-03-10-main-worth-discussing",
    postId: 102,
    userEmail: "user@test.com",
    responseType: "worth_discussing",
    parentResponseId: null,
    content: "Can we talk more about how grief belongs in testimony without becoming a lesson?",
    likedBy: [],
    resonatedBy: [],
    discussedBy: [],
    flaggedBy: [],
    reports: [],
    likeCount: 2,
    resonatesCount: 2,
    discussCount: 6,
    flagCount: 0,
    status: "active",
    createdAt: "2026-03-10T10:18:00.000Z"
  },
  {
    id: 208,
    seedKey: "comment-2026-03-10-main-pushes-back",
    postId: 102,
    userEmail: "user@test.com",
    responseType: "pushes_back",
    parentResponseId: null,
    content: "Victory stories matter too, but they should not be the only stories we platform.",
    likedBy: [],
    resonatedBy: [],
    discussedBy: [],
    flaggedBy: [],
    reports: [],
    likeCount: 1,
    resonatesCount: 1,
    discussCount: 3,
    flagCount: 0,
    status: "active",
    createdAt: "2026-03-10T10:32:00.000Z"
  },
  {
    id: 211,
    seedKey: "comment-2026-03-31-sub-rest-before-breakdown",
    postId: 111,
    userEmail: "user@test.com",
    responseType: "resonates",
    parentResponseId: null,
    content: "Gentle check-ins and honest scheduling would help more than waiting for someone to hit a wall.",
    likedBy: [],
    resonatedBy: [],
    discussedBy: [],
    flaggedBy: [],
    reports: [],
    likeCount: 2,
    resonatesCount: 3,
    discussCount: 2,
    flagCount: 0,
    status: "active",
    createdAt: "2026-04-01T09:10:00.000Z"
  },
  {
    id: 212,
    seedKey: "comment-2026-03-17-sub-gentle-correction",
    postId: 112,
    userEmail: "user@test.com",
    responseType: "worth_discussing",
    parentResponseId: null,
    content: "Gentle correction sounds like staying with a person after the public moment is over.",
    likedBy: [],
    resonatedBy: [],
    discussedBy: [],
    flaggedBy: [],
    reports: [],
    likeCount: 1,
    resonatesCount: 2,
    discussCount: 4,
    flagCount: 0,
    status: "active",
    createdAt: "2026-03-18T09:05:00.000Z"
  },
  {
    id: 213,
    seedKey: "comment-2026-03-10-sub-grief-space",
    postId: 113,
    userEmail: "user@test.com",
    responseType: "resonates",
    parentResponseId: null,
    content: "Hearing unresolved grief spoken plainly would probably help more people feel seen.",
    likedBy: [],
    resonatedBy: [],
    discussedBy: [],
    flaggedBy: [],
    reports: [],
    likeCount: 2,
    resonatesCount: 4,
    discussCount: 2,
    flagCount: 0,
    status: "active",
    createdAt: "2026-03-11T08:50:00.000Z"
  }
];

function ensureAccounts() {
  const stored = localStorage.getItem(ACCOUNT_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(seedAccounts));
  }
}

function normalizeMediaType(value) {
  const mediaType = String(value || "").trim().toLowerCase();
  return SUPPORTED_MEDIA_TYPES.has(mediaType) ? mediaType : "";
}

function inferMediaTypeFromMime(mimeTypeInput) {
  const mimeType = String(mimeTypeInput || "").trim().toLowerCase();
  if (!mimeType) {
    return "";
  }
  if (mimeType === "image/gif") {
    return "gif";
  }
  if (mimeType.startsWith("video/")) {
    return "video";
  }
  if (mimeType.startsWith("audio/")) {
    return "audio";
  }
  if (mimeType.startsWith("image/")) {
    return "image";
  }
  return "";
}

function inferMediaTypeFromFilename(nameInput) {
  const filename = String(nameInput || "").trim().toLowerCase();
  if (!filename) {
    return "";
  }
  if (filename.endsWith(".gif")) {
    return "gif";
  }
  if (/\.(mp4|mov|webm|avi|mkv)$/.test(filename)) {
    return "video";
  }
  if (/\.(mp3|wav|m4a|ogg|aac|flac)$/.test(filename)) {
    return "audio";
  }
  if (/\.(jpg|jpeg|png|webp|bmp|svg)$/.test(filename)) {
    return "image";
  }
  return "";
}

function inferMediaTypeFromPost(post) {
  const explicitMediaType = normalizeMediaType(post.mediaType);
  if (explicitMediaType) {
    return explicitMediaType;
  }
  const mimeBased = inferMediaTypeFromMime(post.mediaMimeType);
  if (mimeBased) {
    return mimeBased;
  }

  const format = String(post.format || "").toLowerCase();
  if (format.includes("gif")) {
    return "gif";
  }
  if (format.includes("video")) {
    return "video";
  }
  if (format.includes("audio")) {
    return "audio";
  }
  if (format.includes("image")) {
    return "image";
  }
  return "";
}

function getFormatForMediaType(mediaType) {
  const normalized = normalizeMediaType(mediaType);
  return normalized ? MEDIA_FORMAT_LABELS[normalized] : "One-minute reflection";
}

function normalizePost(post) {
  const mediaType = inferMediaTypeFromPost(post);
  const mediaMimeType = String(post.mediaMimeType || "").trim();
  const mediaName = String(post.mediaName || "").trim();
  const mediaDataUrl = typeof post.mediaDataUrl === "string" ? post.mediaDataUrl : "";
  return {
    ...post,
    format: post.format || getFormatForMediaType(mediaType),
    whyMatters: post.whyMatters || "",
    hopedConversation: post.hopedConversation || "",
    category: post.category || "General",
    sensitivity: post.sensitivity || "medium",
    declarationAccepted: post.declarationAccepted !== false,
    parentPostId: typeof post.parentPostId === "number" ? post.parentPostId : null,
    sourceCommentId: typeof post.sourceCommentId === "number" ? post.sourceCommentId : null,
    isSubMusing: Boolean(post.parentPostId || post.isSubMusing),
    promotedBy: post.promotedBy || null,
    promotedAt: post.promotedAt || null,
    revisionRequestedBy: post.revisionRequestedBy || null,
    revisionRequestedAt: post.revisionRequestedAt || null,
    mediaType,
    mediaMimeType,
    mediaName,
    mediaDataUrl
  };
}

function normalizeResponse(response) {
  const legacyType = response.type === "pushes back" ? "pushes_back" : response.type;
  const normalizeEmails = (value) =>
    Array.isArray(value)
      ? value.map((email) => String(email || "").trim().toLowerCase()).filter(Boolean)
      : [];
  const likedBy = Array.isArray(response.likedBy)
    ? response.likedBy.map((email) => String(email || "").trim().toLowerCase()).filter(Boolean)
    : [];
  const resonatedBy = normalizeEmails(response.resonatedBy);
  const discussedBy = normalizeEmails(response.discussedBy);
  const reports = getResponseReports(response);
  const flaggedBy = reports.map((report) => report.reporterEmail);
  return {
    ...response,
    responseType: response.responseType || legacyType || "resonates",
    parentResponseId: typeof response.parentResponseId === "number" ? response.parentResponseId : null,
    likedBy,
    resonatedBy,
    discussedBy,
    reports,
    flaggedBy,
    likeCount: Math.max(Number(response.likeCount || likedBy.length), likedBy.length),
    resonatesCount: Math.max(Number(response.resonatesCount || resonatedBy.length), resonatedBy.length),
    discussCount: Math.max(Number(response.discussCount || discussedBy.length), discussedBy.length),
    flagCount: Math.max(Number(response.flagCount || reports.length), reports.length),
    status: response.status || "active"
  };
}

function mergeSeedRecords(storedRecords, seedRecords, normalizer) {
  const normalizedStored = storedRecords.map((record) => normalizer(record));
  const existingIds = new Set(
    normalizedStored
      .map((record) => Number(record.id))
      .filter((id) => Number.isFinite(id))
  );
  const existingSeedKeys = new Set(
    normalizedStored
      .map((record) => String(record.seedKey || "").trim())
      .filter(Boolean)
  );

  seedRecords.forEach((record) => {
    const normalizedSeed = normalizer(record);
    const seedKey = String(normalizedSeed.seedKey || "").trim();
    const id = Number(normalizedSeed.id);

    if ((Number.isFinite(id) && existingIds.has(id)) || (seedKey && existingSeedKeys.has(seedKey))) {
      return;
    }

    normalizedStored.push(normalizedSeed);
    if (Number.isFinite(id)) {
      existingIds.add(id);
    }
    if (seedKey) {
      existingSeedKeys.add(seedKey);
    }
  });

  return normalizedStored;
}

function ensurePosts() {
  const stored = localStorage.getItem(POST_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(POST_STORAGE_KEY, JSON.stringify(seedPosts));
    return;
  }

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(POST_STORAGE_KEY, JSON.stringify(seedPosts));
      return;
    }
    const normalized = mergeSeedRecords(parsed, seedPosts, normalizePost);
    localStorage.setItem(POST_STORAGE_KEY, JSON.stringify(normalized));
  } catch (error) {
    localStorage.setItem(POST_STORAGE_KEY, JSON.stringify(seedPosts));
  }
}

function ensureComments() {
  const stored = localStorage.getItem(COMMENT_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(COMMENT_STORAGE_KEY, JSON.stringify(seedComments));
    return;
  }

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(COMMENT_STORAGE_KEY, JSON.stringify(seedComments));
      return;
    }
    const normalized = mergeSeedRecords(parsed, seedComments, normalizeResponse);
    localStorage.setItem(COMMENT_STORAGE_KEY, JSON.stringify(normalized));
  } catch (error) {
    localStorage.setItem(COMMENT_STORAGE_KEY, JSON.stringify(seedComments));
  }
}

function ensureDismissedNotifications() {
  const stored = localStorage.getItem(DISMISSED_NOTIFICATION_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(DISMISSED_NOTIFICATION_STORAGE_KEY, JSON.stringify([]));
  }
}

function ensureResponseDrafts() {
  const stored = localStorage.getItem(RESPONSE_DRAFT_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(RESPONSE_DRAFT_STORAGE_KEY, JSON.stringify({}));
    return;
  }

  try {
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      localStorage.setItem(RESPONSE_DRAFT_STORAGE_KEY, JSON.stringify({}));
      return;
    }

    const normalized = {};
    Object.entries(parsed).forEach(([key, value]) => {
      if (!key.includes("::") || !value || typeof value !== "object" || Array.isArray(value)) {
        return;
      }

      const content = typeof value.content === "string" ? value.content : "";
      if (!content.trim()) {
        return;
      }

      const responseType = RESPONSE_STREAMS.some((stream) => stream.key === value.responseType)
        ? value.responseType
        : DEFAULT_RESPONSE_TYPE;

      normalized[key] = {
        responseType,
        content,
        updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : new Date().toISOString()
      };
    });

    localStorage.setItem(RESPONSE_DRAFT_STORAGE_KEY, JSON.stringify(normalized));
  } catch (error) {
    localStorage.setItem(RESPONSE_DRAFT_STORAGE_KEY, JSON.stringify({}));
  }
}

function getAccounts() {
  ensureAccounts();
  return JSON.parse(localStorage.getItem(ACCOUNT_STORAGE_KEY) || "[]");
}

function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(accounts));
}

function getPosts() {
  ensurePosts();
  return JSON.parse(localStorage.getItem(POST_STORAGE_KEY) || "[]");
}

function savePosts(posts) {
  localStorage.setItem(POST_STORAGE_KEY, JSON.stringify(posts));
}

function getComments() {
  ensureComments();
  return JSON.parse(localStorage.getItem(COMMENT_STORAGE_KEY) || "[]");
}

function saveComments(comments) {
  localStorage.setItem(COMMENT_STORAGE_KEY, JSON.stringify(comments));
}

function getDismissedNotifications() {
  ensureDismissedNotifications();
  return JSON.parse(localStorage.getItem(DISMISSED_NOTIFICATION_STORAGE_KEY) || "[]");
}

function saveDismissedNotifications(ids) {
  localStorage.setItem(DISMISSED_NOTIFICATION_STORAGE_KEY, JSON.stringify(ids));
}

function getResponseDrafts() {
  ensureResponseDrafts();
  try {
    const parsed = JSON.parse(localStorage.getItem(RESPONSE_DRAFT_STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    return {};
  }
}

function saveResponseDrafts(drafts) {
  localStorage.setItem(RESPONSE_DRAFT_STORAGE_KEY, JSON.stringify(drafts));
}

function buildResponseDraftKey(postId, userEmail) {
  const normalizedPostId = Number(postId);
  const email = String(userEmail || "").trim().toLowerCase();
  if (!email || !Number.isFinite(normalizedPostId)) {
    return "";
  }
  return `${email}::${normalizedPostId}`;
}

function getResponseDraft(postId, userEmail) {
  const key = buildResponseDraftKey(postId, userEmail);
  if (!key) {
    return null;
  }

  const draft = getResponseDrafts()[key];
  if (!draft || typeof draft !== "object" || Array.isArray(draft)) {
    return null;
  }

  const content = typeof draft.content === "string" ? draft.content : "";
  if (!content.trim()) {
    return null;
  }

  const responseType = RESPONSE_STREAMS.some((stream) => stream.key === draft.responseType)
    ? draft.responseType
    : DEFAULT_RESPONSE_TYPE;

  return {
    responseType,
    content,
    updatedAt: typeof draft.updatedAt === "string" ? draft.updatedAt : ""
  };
}

function setResponseDraft(postId, userEmail, draftInput) {
  const key = buildResponseDraftKey(postId, userEmail);
  if (!key) {
    return;
  }

  const content = typeof draftInput?.content === "string" ? draftInput.content : "";
  if (!content.trim()) {
    clearResponseDraft(postId, userEmail);
    return;
  }

  const responseType = RESPONSE_STREAMS.some((stream) => stream.key === draftInput?.responseType)
    ? draftInput.responseType
    : DEFAULT_RESPONSE_TYPE;

  const drafts = getResponseDrafts();
  drafts[key] = {
    responseType,
    content,
    updatedAt: new Date().toISOString()
  };
  saveResponseDrafts(drafts);
}

function clearResponseDraft(postId, userEmail) {
  const key = buildResponseDraftKey(postId, userEmail);
  if (!key) {
    return;
  }

  const drafts = getResponseDrafts();
  if (!Object.prototype.hasOwnProperty.call(drafts, key)) {
    return;
  }
  delete drafts[key];
  saveResponseDrafts(drafts);
}

function isValidThemePreference(themeInput) {
  const theme = String(themeInput || "").trim();
  return THEME_OPTIONS.some((option) => option.key === theme);
}

function getThemePreference() {
  const storedTheme = String(localStorage.getItem(THEME_STORAGE_KEY) || "").trim();
  return isValidThemePreference(storedTheme) ? storedTheme : DEFAULT_THEME;
}

function saveThemePreference(themeInput) {
  const theme = isValidThemePreference(themeInput) ? String(themeInput).trim() : DEFAULT_THEME;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  return theme;
}

function getThemeOption(themeInput) {
  return THEME_OPTIONS.find((option) => option.key === themeInput) || THEME_OPTIONS[0];
}

function applyThemePreference(themeInput = getThemePreference()) {
  const theme = isValidThemePreference(themeInput) ? String(themeInput).trim() : DEFAULT_THEME;
  document.documentElement.dataset.theme = theme;
  if (document.body) {
    document.body.dataset.theme = theme;
  }
  return theme;
}

function setSession(account) {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(account));
}

function getSession() {
  const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function clearSession() {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

function authenticateUser(emailInput, passwordInput) {
  const email = String(emailInput || "").trim().toLowerCase();
  const password = String(passwordInput || "");
  return getAccounts().find((entry) => entry.email === email && entry.password === password) || null;
}

function validateSignupInput(emailInput, passwordInput, confirmPasswordInput) {
  const email = String(emailInput || "").trim().toLowerCase();
  const password = String(passwordInput || "");
  const confirmPassword = String(confirmPasswordInput || "");

  if (!email || !password || !confirmPassword) {
    return { valid: false, message: "Complete all signup fields." };
  }

  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { valid: false, message: "Passwords do not match." };
  }

  const accounts = getAccounts();
  const alreadyExists = accounts.some((account) => account.email === email);
  if (alreadyExists) {
    return { valid: false, message: "An account with this email already exists." };
  }

  return { valid: true, email, password };
}

function bindLogin() {
  const form = document.getElementById("login-form");
  const message = document.getElementById("login-message");
  if (!form || !message) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const account = authenticateUser(formData.get("email"), formData.get("password"));

    if (!account) {
      message.textContent = "Invalid email or password.";
      return;
    }

    setSession(account);
    window.location.href = account.redirect;
  });
}

function bindSignup() {
  const form = document.getElementById("signup-form");
  const message = document.getElementById("signup-message");
  if (!form || !message) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const validation = validateSignupInput(
      formData.get("email"),
      formData.get("password"),
      formData.get("confirmPassword")
    );

    if (!validation.valid) {
      message.textContent = validation.message;
      return;
    }

    const account = {
      email: validation.email,
      password: validation.password,
      role: "user",
      redirect: "user.html"
    };

    const accounts = getAccounts();
    accounts.push(account);
    saveAccounts(accounts);
    setSession(account);
    message.textContent = "Account created. Redirecting...";
    form.reset();
    window.location.href = account.redirect;
  });
}

function isUserAreaPage(pageInput) {
  const page = String(pageInput || "");
  return page === "user" || page === "user-settings" || page === "user-suggestion";
}

function guardPage() {
  const page = document.body.dataset.page;
  const session = getSession();

  if (page === "login") {
    const params = new URLSearchParams(window.location.search);
    const showLogin = params.get("login") === "1";

    if (session?.redirect) {
      window.location.replace(session.redirect);
      return;
    }

    if (!showLogin) {
      window.location.replace("user.html");
    }
    return;
  }

  if (page === "admin") {
    if (!session) {
      window.location.replace("index.html");
      return;
    }
    if (session.role !== "admin") {
      window.location.replace("user.html");
      return;
    }
  }

  if (isUserAreaPage(page) && session?.role === "admin") {
    window.location.replace("admin.html");
    return;
  }

  const roleSlot = document.getElementById("account-role");
  if (roleSlot) {
    roleSlot.textContent = session
      ? session.role.charAt(0).toUpperCase() + session.role.slice(1)
      : "Guest";
  }
}

function bindLogout() {
  const button = document.getElementById("logout-button");
  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    clearSession();
    window.location.href = "index.html";
  });
}

function formatDate(value) {
  return new Date(value).toLocaleString();
}

function formatRelativeDate(value) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) {
    return formatDate(value);
  }

  const diffMs = Date.now() - timestamp;
  if (diffMs < 0) {
    return formatDate(value);
  }

  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 60) {
    return `${Math.max(1, diffMinutes)}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) {
    return `${diffWeeks}w ago`;
  }

  return formatDate(value);
}

function formatWeekLabel(value) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) {
    return "Weekly muse";
  }

  return `Week of ${new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  })}`;
}

function getSummaryExcerpt(post, maxLength = 170) {
  const source = String(
    post.content ||
    post.whyMatters ||
    post.hopedConversation ||
    ""
  ).replace(/\s+/g, " ").trim();

  if (!source) {
    return "";
  }

  if (source.length <= maxLength) {
    return source;
  }

  return `${source.slice(0, maxLength).trimEnd()}...`;
}

function isLegacyDemoPost(post) {
  if (!post || typeof post !== "object" || Array.isArray(post)) {
    return false;
  }

  if (post.parentPostId || post.status !== "approved") {
    return false;
  }

  const seedKey = String(post.seedKey || "").trim();
  const title = String(post.title || "").trim().toLowerCase();
  return !seedKey && LEGACY_DEMO_POST_TITLES.has(title);
}

function getResponseLabel(responseType) {
  const stream = RESPONSE_STREAMS.find((entry) => entry.key === responseType);
  return stream ? stream.label : "Resonates";
}

function isValidResponseType(value) {
  return RESPONSE_STREAMS.some((stream) => stream.key === value);
}

function getResponseTypeOrDefault(value) {
  const responseType = String(value || "").trim();
  return isValidResponseType(responseType) ? responseType : DEFAULT_RESPONSE_TYPE;
}

function isValidReportReason(value) {
  return REPORT_REASON_OPTIONS.some((entry) => entry.key === value);
}

function isValidReportUrgency(value) {
  return REPORT_URGENCY_OPTIONS.some((entry) => entry.key === value);
}

function getReportReasonLabel(reason) {
  const option = REPORT_REASON_OPTIONS.find((entry) => entry.key === reason);
  return option ? option.label : "Other serious concern";
}

function getReportUrgencyLabel(urgency) {
  const option = REPORT_URGENCY_OPTIONS.find((entry) => entry.key === urgency);
  return option ? option.label : "Medium urgency";
}

function normalizeReportEntry(report) {
  if (!report || typeof report !== "object" || Array.isArray(report)) {
    return null;
  }

  const reporterEmail = String(report.reporterEmail || "").trim().toLowerCase();
  if (!reporterEmail) {
    return null;
  }

  const reason = isValidReportReason(report.reason) ? report.reason : "other";
  const urgency = isValidReportUrgency(report.urgency) ? report.urgency : "medium";
  const details = typeof report.details === "string" ? report.details.trim() : "";
  const detailText = details || "Legacy report submitted before detailed report fields were required.";
  const createdAt = typeof report.createdAt === "string" ? report.createdAt : new Date().toISOString();

  return {
    id: typeof report.id === "number" ? report.id : Date.now(),
    reporterEmail,
    reason,
    urgency,
    details: detailText,
    createdAt
  };
}

function getResponseReports(response) {
  const normalized = [];
  const seenReporters = new Set();

  if (Array.isArray(response.reports)) {
    response.reports.forEach((report) => {
      const next = normalizeReportEntry(report);
      if (!next || seenReporters.has(next.reporterEmail)) {
        return;
      }
      seenReporters.add(next.reporterEmail);
      normalized.push(next);
    });
  }

  const legacyFlaggedBy = Array.isArray(response.flaggedBy)
    ? response.flaggedBy.map((email) => String(email || "").trim().toLowerCase()).filter(Boolean)
    : [];
  legacyFlaggedBy.forEach((reporterEmail) => {
    if (seenReporters.has(reporterEmail)) {
      return;
    }
    seenReporters.add(reporterEmail);
    normalized.push({
      id: Date.now() + normalized.length,
      reporterEmail,
      reason: "other",
      urgency: "medium",
      details: "Legacy report submitted before detailed report fields were required.",
      createdAt: response.createdAt || new Date().toISOString()
    });
  });

  return normalized.sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
}

function countWords(value) {
  return String(value || "").trim().split(/\s+/).filter(Boolean).length;
}

function getResponseScore(response) {
  return (response.resonatesCount * 2) + response.discussCount + response.likeCount - (response.flagCount * 2);
}

function sortPostsByApprovalDateDesc(posts) {
  return [...posts].sort((first, second) => {
    const firstDate = new Date(first.approvedAt || first.createdAt).getTime();
    const secondDate = new Date(second.approvedAt || second.createdAt).getTime();
    return secondDate - firstDate;
  });
}

function getLatestApprovedPost(posts) {
  return getRecentApprovedPosts(posts, 1)[0] || null;
}

function getRecentApprovedPosts(posts, limit = 3) {
  return sortPostsByApprovalDateDesc(
    posts.filter((post) => post.status === "approved" && !post.parentPostId && !isLegacyDemoPost(post))
  ).slice(0, limit);
}

function getApprovedSubMusings(posts, parentPostId) {
  return posts
    .filter((post) => post.status === "approved" && post.parentPostId === parentPostId)
    .sort((first, second) => {
      const firstDate = new Date(first.approvedAt || first.createdAt).getTime();
      const secondDate = new Date(second.approvedAt || second.createdAt).getTime();
      return firstDate - secondDate;
    });
}

function getActiveResponsesForPost(comments, postId) {
  return comments.filter((comment) =>
    comment.postId === postId &&
    comment.status !== "removed"
  );
}

function getTopLevelResponsesForPost(comments, postId) {
  return getActiveResponsesForPost(comments, postId)
    .filter((response) => response.parentResponseId === null);
}

function getChildResponsesForResponse(comments, parentResponseId) {
  return comments
    .filter((response) =>
      response.parentResponseId === parentResponseId &&
      response.status !== "removed"
    )
    .sort((first, second) =>
      new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime()
    );
}

function hasOpenSubMusingRequest(posts, parentPostId, sourceCommentId, userEmail = "") {
  const normalizedEmail = String(userEmail || "").trim().toLowerCase();
  return posts.some((post) =>
    post.parentPostId === parentPostId &&
    post.sourceCommentId === sourceCommentId &&
    (!normalizedEmail || String(post.promotedBy || "").trim().toLowerCase() === normalizedEmail) &&
    post.status !== "rejected"
  );
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Unable to read the selected file."));
    reader.readAsDataURL(file);
  });
}

function buildMediaPreview(post) {
  const mediaDataUrl = String(post.mediaDataUrl || "").trim();
  if (!mediaDataUrl) {
    return null;
  }

  const mediaType = inferMediaTypeFromPost(post);
  if (!mediaType) {
    return null;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "media-preview";
  wrapper.classList.add(mediaType);

  if (mediaType === "video") {
    const video = document.createElement("video");
    video.controls = true;
    video.preload = "metadata";
    video.playsInline = true;
    video.src = mediaDataUrl;
    wrapper.appendChild(video);
  } else if (mediaType === "audio") {
    wrapper.classList.add("audio-only");
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.preload = "metadata";
    audio.src = mediaDataUrl;
    wrapper.appendChild(audio);
  } else {
    const image = document.createElement("img");
    image.src = mediaDataUrl;
    image.loading = "lazy";
    image.alt = post.title
      ? `Attached media for ${post.title}`
      : "Attached media";
    wrapper.appendChild(image);
  }

  if (post.mediaName) {
    const caption = document.createElement("p");
    caption.className = "media-caption";
    caption.textContent = post.mediaName;
    wrapper.appendChild(caption);
  }

  return wrapper;
}

function buildPostCard(post, options = {}) {
  const card = document.createElement("article");
  card.className = "feed-card";
  const isHomepageListing = document.body.dataset.page === "user" && !options.includeApprove && !options.showOwner;
  const allComments = (options.includeComments || isHomepageListing) ? getComments() : [];
  const postResponses = (options.includeComments || isHomepageListing)
    ? getActiveResponsesForPost(allComments, post.id)
    : [];
  const subMusingCount = Number(options.subMusingCount || 0);

  if (post.parentPostId) {
    card.classList.add("sub-musing-card");
  }
  if (isHomepageListing) {
    card.classList.add("reddit-feed-card");
  }

  let contentContainer = card;
  if (isHomepageListing) {
    const postScore = postResponses.reduce((sum, response) => sum + Math.max(0, getResponseScore(response)), 0);
    const voteRail = document.createElement("div");
    voteRail.className = "reddit-feed-vote";
    voteRail.setAttribute("aria-hidden", "true");

    const voteScore = document.createElement("strong");
    voteScore.className = "reddit-feed-score";
    voteScore.textContent = String(postScore);

    const voteLabel = document.createElement("span");
    voteLabel.className = "reddit-feed-score-label";
    voteLabel.textContent = "Depth";

    const body = document.createElement("div");
    body.className = "reddit-feed-body";

    const listingMeta = document.createElement("p");
    listingMeta.className = "reddit-listing-meta";
    listingMeta.textContent = `Anonymous post | ${formatRelativeDate(post.approvedAt || post.createdAt)} | Community board`;

    voteRail.append(voteScore, voteLabel);
    body.appendChild(listingMeta);
    card.append(voteRail, body);
    contentContainer = body;
  }

  const title = document.createElement("h3");
  title.textContent = post.title;

  const content = document.createElement("p");
  content.textContent = post.content;

  const formatLine = document.createElement("p");
  formatLine.className = "meta-row";
  formatLine.textContent = post.format || "Reflection";

  const meta = document.createElement("div");
  meta.className = "meta-row";

  const author = document.createElement("span");
  author.textContent = options.showOwner ? `Submitted by ${post.userEmail}` : "Submitted anonymously";

  const status = document.createElement("span");
  status.className = "badge";
  status.textContent = String(post.status || "pending").replaceAll("_", " ");

  const created = document.createElement("span");
  created.textContent = `Submitted ${formatDate(post.createdAt)}`;

  meta.append(author, status, created);

  const metadataLine = document.createElement("div");
  metadataLine.className = "meta-row";
  metadataLine.textContent = `${post.category || "General"}  |  ${String(post.sensitivity || "medium").toUpperCase()} sensitivity`;

  if (post.approvedAt) {
    const approved = document.createElement("span");
    approved.textContent = `Approved ${formatDate(post.approvedAt)}`;
    meta.appendChild(approved);
  }

  if (post.rejectedAt) {
    const rejected = document.createElement("span");
    rejected.textContent = `Rejected ${formatDate(post.rejectedAt)}`;
    meta.appendChild(rejected);
  }

  contentContainer.append(title, formatLine, content);

  const mediaPreview = buildMediaPreview(post);
  if (mediaPreview) {
    contentContainer.appendChild(mediaPreview);
  }

  if (post.parentPostId) {
    const subMusingLine = document.createElement("p");
    subMusingLine.className = "meta-row";
    subMusingLine.textContent = post.promotedBy
      ? `Sub-muse requested by ${post.promotedBy}`
      : "Sub-muse linked to the main musing";
    contentContainer.appendChild(subMusingLine);
  }

  if (post.whyMatters) {
    const whyMatters = document.createElement("p");
    whyMatters.className = "lead compact";
    whyMatters.textContent = `Why this matters: ${post.whyMatters}`;
    contentContainer.appendChild(whyMatters);
  }

  if (post.hopedConversation) {
    const hopedConversation = document.createElement("p");
    hopedConversation.className = "lead compact";
    hopedConversation.textContent = `Conversation prompt: ${post.hopedConversation}`;
    contentContainer.appendChild(hopedConversation);
  }

  contentContainer.append(metadataLine, meta);

  if (isHomepageListing) {
    const listingActions = document.createElement("div");
    listingActions.className = "reddit-listing-actions";

    const responseChip = document.createElement("span");
    responseChip.textContent = `${postResponses.length} responses`;
    listingActions.appendChild(responseChip);

    if (!post.parentPostId && subMusingCount > 0) {
      const openSubMusingsButton = document.createElement("button");
      openSubMusingsButton.type = "button";
      openSubMusingsButton.className = "sub-musing-link-button";
      openSubMusingsButton.dataset.action = "open-sub-musings";
      openSubMusingsButton.dataset.postId = String(post.id);
      openSubMusingsButton.textContent = subMusingCount === 1
        ? "Open 1 sub-musing"
        : `Open ${subMusingCount} sub-musings`;
      openSubMusingsButton.setAttribute(
        "aria-label",
        subMusingCount === 1
          ? "Open the sub-musing discussion"
          : `Open ${subMusingCount} sub-musing discussions`
      );
      listingActions.appendChild(openSubMusingsButton);
    }

    ["Reflect", "Share", "Keep"].forEach((label) => {
      const chip = document.createElement("span");
      chip.textContent = label;
      listingActions.appendChild(chip);
    });
    contentContainer.appendChild(listingActions);
  }

  if (options.includeApprove) {
    const actions = document.createElement("div");
    actions.className = "actions-row";

    const approveButton = document.createElement("button");
    approveButton.type = "button";
    approveButton.textContent = "Approve";
    approveButton.dataset.postId = String(post.id);
    approveButton.dataset.action = "approve";

    const rejectButton = document.createElement("button");
    rejectButton.type = "button";
    rejectButton.textContent = "Reject";
    rejectButton.className = "secondary";
    rejectButton.dataset.postId = String(post.id);
    rejectButton.dataset.action = "reject";

    const reviseButton = document.createElement("button");
    reviseButton.type = "button";
    reviseButton.textContent = "Request Revision";
    reviseButton.className = "secondary";
    reviseButton.dataset.postId = String(post.id);
    reviseButton.dataset.action = "revise";

    actions.append(approveButton, reviseButton, rejectButton);
    contentContainer.appendChild(actions);
  }

  if (options.includeComments) {
    const topLevelResponses = getTopLevelResponsesForPost(allComments, post.id);
    const posts = getPosts();
    const streamGrid = document.createElement("div");
    streamGrid.className = "response-stream-grid";

    RESPONSE_STREAMS.forEach((stream) => {
      const streamBlock = document.createElement("details");
      streamBlock.className = "response-stream";

      const topResponses = topLevelResponses
        .filter((response) => response.responseType === stream.key)
        .sort((first, second) => {
          const scoreDiff = getResponseScore(second) - getResponseScore(first);
          if (scoreDiff !== 0) {
            return scoreDiff;
          }
          return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
        })
        .slice(0, 3);

      const streamSummary = document.createElement("summary");
      streamSummary.className = "response-stream-summary";

      const streamTitle = document.createElement("span");
      streamTitle.className = "response-stream-title";
      streamTitle.textContent = `Top ${stream.label}`;

      const streamCount = document.createElement("span");
      streamCount.className = "response-stream-count";
      streamCount.textContent = topResponses.length === 1 ? "1 response" : `${topResponses.length} responses`;

      streamSummary.append(streamTitle, streamCount);
      streamBlock.appendChild(streamSummary);

      if (topResponses.length === 0) {
        const emptyStream = document.createElement("p");
        emptyStream.className = "empty-state";
        emptyStream.textContent = `No ${stream.label.toLowerCase()} responses yet.`;
        streamBlock.appendChild(emptyStream);
      } else {
        topResponses.forEach((response) => {
          const item = document.createElement("div");
          item.className = "comment-item";
          item.dataset.commentId = String(response.id);
          const responseReplies = getChildResponsesForResponse(allComments, response.id);

          const text = document.createElement("p");
          text.textContent = response.content;

          const metaText = document.createElement("span");
          metaText.className = "meta-row";
          metaText.textContent = `Anonymous response | ${formatDate(response.createdAt)}`;

          const signals = document.createElement("span");
          signals.className = "meta-row";
          signals.textContent = `${response.likeCount} \u2665 | ${response.resonatesCount} resonates | ${response.discussCount} discuss | ${response.flagCount} reports | ${responseReplies.length} ${responseReplies.length === 1 ? "comment" : "comments"}`;

          item.append(text, metaText, signals);

          if (responseReplies.length > 0) {
            const replyList = document.createElement("div");
            replyList.className = "response-reply-list";

            responseReplies.forEach((reply) => {
              const replyItem = document.createElement("div");
              replyItem.className = "response-reply-item";

              const replyText = document.createElement("p");
              replyText.textContent = reply.content;

              const replyMeta = document.createElement("span");
              replyMeta.className = "meta-row";
              replyMeta.textContent = `Anonymous comment | ${formatDate(reply.createdAt)}`;

              replyItem.append(replyText, replyMeta);
              replyList.appendChild(replyItem);
            });

            item.appendChild(replyList);
          }

          if (options.allowSignals || options.allowComment) {
            const userEmail = String(options.currentUserEmail || "").toLowerCase();
            const reports = getResponseReports(response);
            const hasLikedResponse = Boolean(userEmail) && Array.isArray(response.likedBy) && response.likedBy.includes(userEmail);
            const hasResonated = Boolean(userEmail) && Array.isArray(response.resonatedBy) && response.resonatedBy.includes(userEmail);
            const hasDiscussed = Boolean(userEmail) && Array.isArray(response.discussedBy) && response.discussedBy.includes(userEmail);
            const hasReported = Boolean(userEmail) && reports.some((report) => report.reporterEmail === userEmail);
            const signalRow = document.createElement("div");
            signalRow.className = "actions-row compact-actions";

            if (options.allowSignals) {
              const likeButton = document.createElement("button");
              likeButton.type = "button";
              likeButton.className = "secondary";
              likeButton.dataset.action = "like-response";
              likeButton.dataset.commentId = String(response.id);
              likeButton.textContent = hasLikedResponse ? "\u2665 Liked" : "\u2661 Like";
              likeButton.disabled = hasLikedResponse;
              signalRow.appendChild(likeButton);
            }

            if (options.allowComment) {
              const replyButton = document.createElement("button");
              replyButton.type = "button";
              replyButton.className = "secondary";
              replyButton.dataset.action = "toggle-reply-form";
              replyButton.dataset.commentId = String(response.id);
              replyButton.textContent = responseReplies.length > 0 ? `Comment (${responseReplies.length})` : "Comment";
              signalRow.appendChild(replyButton);
            }

            if (options.allowSignals) {
              const actionMenu = document.createElement("details");
              actionMenu.className = "action-menu";

              const menuToggle = document.createElement("summary");
              menuToggle.className = "menu-toggle";
              menuToggle.textContent = "\u2630";

              const menuPanel = document.createElement("div");
              menuPanel.className = "menu-panel";

              const resonateButton = document.createElement("button");
              resonateButton.type = "button";
              resonateButton.className = "secondary";
              resonateButton.dataset.action = "signal-resonate";
              resonateButton.dataset.commentId = String(response.id);
              resonateButton.textContent = hasResonated ? "Resonated" : "Resonates";
              resonateButton.disabled = hasResonated;
              menuPanel.appendChild(resonateButton);

              const discussButton = document.createElement("button");
              discussButton.type = "button";
              discussButton.className = "secondary";
              discussButton.dataset.action = "signal-discuss";
              discussButton.dataset.commentId = String(response.id);
              discussButton.textContent = hasDiscussed ? "Marked Discuss" : "Worth discussing";
              discussButton.disabled = hasDiscussed;
              menuPanel.appendChild(discussButton);

              const reportButton = document.createElement("button");
              reportButton.type = "button";
              reportButton.className = "secondary";
              reportButton.dataset.action = "open-report-form";
              reportButton.dataset.commentId = String(response.id);
              reportButton.textContent = hasReported ? "Reported" : "Report concern";
              reportButton.disabled = hasReported;
              menuPanel.appendChild(reportButton);

              if (!post.parentPostId) {
                const alreadyRequested = hasOpenSubMusingRequest(posts, post.id, response.id, userEmail);
                const requestSubMusingButton = document.createElement("button");
                requestSubMusingButton.type = "button";
                requestSubMusingButton.className = "secondary";
                requestSubMusingButton.dataset.action = "request-sub-musing";
                requestSubMusingButton.dataset.postId = String(post.id);
                requestSubMusingButton.dataset.commentId = String(response.id);
                requestSubMusingButton.textContent = alreadyRequested ? "Sent To Admin" : "Further To Admin";
                requestSubMusingButton.disabled = alreadyRequested;
                menuPanel.appendChild(requestSubMusingButton);
              }

              actionMenu.append(menuToggle, menuPanel);
              signalRow.appendChild(actionMenu);
            }

            item.appendChild(signalRow);

            if (options.allowSignals && hasReported) {
              const alreadyReported = document.createElement("p");
              alreadyReported.className = "meta-row";
              alreadyReported.textContent = "You have already submitted a report for this response.";
              item.appendChild(alreadyReported);
            } else if (options.allowSignals) {
              const reportForm = document.createElement("form");
              reportForm.className = "report-form";
              reportForm.dataset.commentId = String(response.id);
              reportForm.hidden = true;

              const reasonLabel = document.createElement("label");
              const reasonText = document.createElement("span");
              reasonText.textContent = "Report reason type";
              const reasonSelect = document.createElement("select");
              reasonSelect.name = "reportReason";
              reasonSelect.required = true;
              const reasonPlaceholder = document.createElement("option");
              reasonPlaceholder.value = "";
              reasonPlaceholder.textContent = "Select reason";
              reasonPlaceholder.disabled = true;
              reasonPlaceholder.selected = true;
              reasonSelect.appendChild(reasonPlaceholder);
              REPORT_REASON_OPTIONS.forEach((optionValue) => {
                const option = document.createElement("option");
                option.value = optionValue.key;
                option.textContent = optionValue.label;
                reasonSelect.appendChild(option);
              });
              reasonLabel.append(reasonText, reasonSelect);

              const urgencyLabel = document.createElement("label");
              const urgencyText = document.createElement("span");
              urgencyText.textContent = "Review urgency";
              const urgencySelect = document.createElement("select");
              urgencySelect.name = "reportUrgency";
              urgencySelect.required = true;
              REPORT_URGENCY_OPTIONS.forEach((optionValue, index) => {
                const option = document.createElement("option");
                option.value = optionValue.key;
                option.textContent = optionValue.label;
                if (index === 1) {
                  option.selected = true;
                }
                urgencySelect.appendChild(option);
              });
              urgencyLabel.append(urgencyText, urgencySelect);

              const detailsLabel = document.createElement("label");
              const detailsText = document.createElement("span");
              detailsText.textContent = "Detailed report explanation";
              const detailsTextarea = document.createElement("textarea");
              detailsTextarea.name = "reportDetails";
              detailsTextarea.rows = 4;
              detailsTextarea.required = true;
              detailsTextarea.minLength = REPORT_DETAIL_MIN_CHARS;
              detailsTextarea.maxLength = 1000;
              detailsTextarea.placeholder = `Explain what happened and why this needs review (${REPORT_DETAIL_MIN_CHARS}+ characters).`;
              detailsLabel.append(detailsText, detailsTextarea);

              const reportSubmit = document.createElement("button");
              reportSubmit.type = "submit";
              reportSubmit.className = "secondary";
              reportSubmit.textContent = "Submit report";

              const reportMessage = document.createElement("p");
              reportMessage.className = "message";
              reportMessage.setAttribute("aria-live", "polite");

              reportForm.append(reasonLabel, urgencyLabel, detailsLabel, reportSubmit, reportMessage);
              item.appendChild(reportForm);
            }

            if (options.allowComment) {
              const replyForm = document.createElement("form");
              replyForm.className = "reply-form";
              replyForm.dataset.postId = String(post.id);
              replyForm.dataset.parentResponseId = String(response.id);
              replyForm.hidden = true;

              const replyType = document.createElement("input");
              replyType.type = "hidden";
              replyType.name = "responseType";
              replyType.value = response.responseType;

              const replyLabel = document.createElement("label");
              const replyLabelText = document.createElement("span");
              replyLabelText.textContent = `Comment on this ${getResponseLabel(response.responseType).toLowerCase()} response`;
              const replyTextarea = document.createElement("textarea");
              replyTextarea.name = "comment";
              replyTextarea.rows = 3;
              replyTextarea.maxLength = 1500;
              replyTextarea.placeholder = "Write a short anonymous comment";
              replyTextarea.required = true;
              replyLabel.append(replyLabelText, replyTextarea);

              const replyHelper = document.createElement("p");
              replyHelper.className = "empty-state";
              replyHelper.textContent = `Keep comments under ${RESPONSE_WORD_LIMIT} words.`;

              const replyActions = document.createElement("div");
              replyActions.className = "actions-row compact-actions response-form-actions";

              const replySubmit = document.createElement("button");
              replySubmit.type = "submit";
              replySubmit.textContent = "Post comment";

              const replyCancel = document.createElement("button");
              replyCancel.type = "button";
              replyCancel.className = "secondary";
              replyCancel.dataset.action = "cancel-reply-form";
              replyCancel.textContent = "Cancel";

              const replyMessage = document.createElement("p");
              replyMessage.className = "message";
              replyMessage.setAttribute("aria-live", "polite");

              replyActions.append(replySubmit, replyCancel);
              replyForm.append(replyType, replyLabel, replyHelper, replyActions, replyMessage);
              item.appendChild(replyForm);
            }
          }

          streamBlock.appendChild(item);
        });
      }

      streamGrid.appendChild(streamBlock);
    });

    contentContainer.appendChild(streamGrid);

    if (options.allowComment) {
      const currentUserEmail = String(options.currentUserEmail || "").trim().toLowerCase();
      const draft = currentUserEmail ? getResponseDraft(post.id, currentUserEmail) : null;

      const form = document.createElement("form");
      form.className = "comment-form response-form";
      form.dataset.postId = String(post.id);

      const typeLabel = document.createElement("label");
      const typeText = document.createElement("span");
      typeText.textContent = "Response stream";
      const typeSelect = document.createElement("select");
      typeSelect.name = "responseType";
      RESPONSE_STREAMS.forEach((stream) => {
        const option = document.createElement("option");
        option.value = stream.key;
        option.textContent = stream.label;
        typeSelect.appendChild(option);
      });
      typeSelect.value = draft ? getResponseTypeOrDefault(draft.responseType) : DEFAULT_RESPONSE_TYPE;
      typeLabel.append(typeText, typeSelect);

      const textarea = document.createElement("textarea");
      textarea.name = "comment";
      textarea.rows = 4;
      textarea.maxLength = 1500;
      textarea.placeholder = "Share a short anonymous response";
      textarea.required = true;
      textarea.value = draft?.content || "";

      const helper = document.createElement("p");
      helper.className = "empty-state";
      helper.textContent = `Keep responses under ${RESPONSE_WORD_LIMIT} words.`;

      const draftActions = document.createElement("div");
      draftActions.className = "actions-row compact-actions response-form-actions";

      const saveDraft = document.createElement("button");
      saveDraft.type = "button";
      saveDraft.className = "secondary";
      saveDraft.dataset.action = "save-response-draft";
      saveDraft.textContent = "Save draft";

      const clearDraft = document.createElement("button");
      clearDraft.type = "button";
      clearDraft.className = "secondary";
      clearDraft.dataset.action = "clear-response-draft";
      clearDraft.textContent = "Clear draft";

      draftActions.append(saveDraft, clearDraft);

      const submit = document.createElement("button");
      submit.type = "submit";
      submit.textContent = "Submit anonymous response";

      const formMessage = document.createElement("p");
      formMessage.className = "message";
      formMessage.setAttribute("aria-live", "polite");
      if (draft) {
        formMessage.textContent = "Saved draft restored.";
      }

      form.append(typeLabel, textarea, helper, draftActions, submit, formMessage);
      contentContainer.append(form);
    } else {
      const guestPrompt = document.createElement("div");
      guestPrompt.className = "guest-login-prompt";

      const guestHint = document.createElement("p");
      guestHint.className = "empty-state";
      guestHint.textContent = "Login to submit an anonymous response.";

      const guestLoginButton = document.createElement("button");
      guestLoginButton.type = "button";
      guestLoginButton.className = "secondary";
      guestLoginButton.textContent = "Login to respond";
      guestLoginButton.dataset.action = "open-login-modal";

      guestPrompt.append(guestHint, guestLoginButton);
      contentContainer.append(guestPrompt);
    }
  }

  return card;
}

function renderAdminPosts() {
  const container = document.getElementById("admin-post-list");
  const emptyState = document.getElementById("admin-empty-state");
  const pendingCount = document.getElementById("pending-count");
  if (!container || !emptyState || !pendingCount) {
    return;
  }

  const pendingPosts = getPosts().filter((post) => post.status === "pending" && !post.parentPostId);
  pendingCount.textContent = `${pendingPosts.length} waiting for review`;
  container.innerHTML = "";

  pendingPosts.forEach((post) => {
    container.appendChild(buildPostCard(post, { includeApprove: true, showOwner: true }));
  });

  emptyState.hidden = pendingPosts.length > 0;
}

function renderSubMusingRequests() {
  const container = document.getElementById("submuse-request-list");
  const emptyState = document.getElementById("submuse-empty-state");
  const submuseCount = document.getElementById("submuse-count");
  if (!container || !emptyState || !submuseCount) {
    return;
  }

  const pendingSubMusings = getPosts().filter((post) => post.status === "pending" && Boolean(post.parentPostId));
  submuseCount.textContent = `${pendingSubMusings.length} awaiting review`;
  container.innerHTML = "";

  pendingSubMusings.forEach((post) => {
    container.appendChild(buildPostCard(post, { includeApprove: true, showOwner: true }));
  });

  emptyState.hidden = pendingSubMusings.length > 0;
}

function renderFlaggedResponses() {
  const container = document.getElementById("flagged-response-list");
  const emptyState = document.getElementById("flagged-empty-state");
  const flaggedCount = document.getElementById("flagged-count");
  if (!container || !emptyState || !flaggedCount) {
    return;
  }

  const postsById = new Map(getPosts().map((post) => [post.id, post]));
  const flaggedResponses = getComments()
    .filter((response) => response.status !== "removed" && getResponseReports(response).length > 0)
    .sort((first, second) => {
      const flagDiff = getResponseReports(second).length - getResponseReports(first).length;
      if (flagDiff !== 0) {
        return flagDiff;
      }
      return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
    });

  flaggedCount.textContent = `${flaggedResponses.length} reported responses`;
  container.innerHTML = "";

  flaggedResponses.forEach((response) => {
    const card = document.createElement("article");
    card.className = "feed-card";

    const title = document.createElement("h3");
    title.textContent = `${getResponseLabel(response.responseType)} response`;

    const content = document.createElement("p");
    content.textContent = response.content;

    const relatedPost = postsById.get(response.postId);
    const context = document.createElement("p");
    context.className = "meta-row";
    context.textContent = relatedPost
      ? `On: ${relatedPost.title}`
      : "Post unavailable";

    const meta = document.createElement("p");
    meta.className = "meta-row";
    const reports = getResponseReports(response);
    meta.textContent = `${reports.length} reports | ${response.resonatesCount} resonates | ${response.discussCount} discuss`;

    const reasonCounts = new Map();
    reports.forEach((report) => {
      const key = getReportReasonLabel(report.reason);
      reasonCounts.set(key, (reasonCounts.get(key) || 0) + 1);
    });
    const reasonSummary = document.createElement("p");
    reasonSummary.className = "meta-row";
    reasonSummary.textContent = `Reason summary: ${Array.from(reasonCounts.entries())
      .map(([label, count]) => `${label} (${count})`)
      .join(", ")}`;

    const reportList = document.createElement("div");
    reportList.className = "report-list";
    reports.forEach((report) => {
      const reportItem = document.createElement("article");
      reportItem.className = "report-item";

      const reportMeta = document.createElement("p");
      reportMeta.className = "meta-row report-meta";
      reportMeta.textContent = `${getReportReasonLabel(report.reason)} | ${getReportUrgencyLabel(report.urgency)} | ${formatDate(report.createdAt)} | ${report.reporterEmail}`;

      const reportDetails = document.createElement("p");
      reportDetails.textContent = report.details;

      reportItem.append(reportMeta, reportDetails);
      reportList.appendChild(reportItem);
    });

    const actions = document.createElement("div");
    actions.className = "actions-row";

    const keepButton = document.createElement("button");
    keepButton.type = "button";
    keepButton.className = "secondary";
    keepButton.dataset.action = "flag-keep";
    keepButton.dataset.commentId = String(response.id);
    keepButton.textContent = "Keep response";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "secondary";
    removeButton.dataset.action = "flag-remove";
    removeButton.dataset.commentId = String(response.id);
    removeButton.textContent = "Remove response";

    actions.append(keepButton, removeButton);
    card.append(title, content, context, meta, reasonSummary, reportList, actions);
    container.appendChild(card);
  });

  emptyState.hidden = flaggedResponses.length > 0;
}

function buildMusingThread(post, options = {}) {
  const posts = Array.isArray(options.posts) ? options.posts : getPosts();
  const comments = Array.isArray(options.comments) ? options.comments : getComments();
  const includeSubMusings = options.includeSubMusings !== false;
  const topLevelResponses = getTopLevelResponsesForPost(comments, post.id);
  const approvedSubMusings = includeSubMusings ? getApprovedSubMusings(posts, post.id) : [];

  const thread = document.createElement("details");
  thread.className = "muse-thread-card";
  thread.dataset.postId = String(post.id);
  if (options.nested) {
    thread.classList.add("is-nested");
  }
  if (options.open) {
    thread.open = true;
  }

  const summary = document.createElement("summary");
  summary.className = "muse-thread-summary";

  const summaryCopy = document.createElement("div");
  summaryCopy.className = "muse-summary-copy";

  const summaryEyebrow = document.createElement("p");
  summaryEyebrow.className = "muse-summary-eyebrow";
  summaryEyebrow.textContent = options.nested
    ? "Follow-up sub-musing"
    : formatWeekLabel(post.approvedAt || post.createdAt);

  const summaryTitle = document.createElement("strong");
  summaryTitle.className = "muse-summary-title";
  summaryTitle.textContent = post.title;

  const summaryExcerpt = document.createElement("p");
  summaryExcerpt.className = "muse-summary-excerpt";
  summaryExcerpt.textContent = getSummaryExcerpt(post);

  const summaryMeta = document.createElement("div");
  summaryMeta.className = "muse-summary-meta";

  const metaChips = [
    post.category || "General",
    topLevelResponses.length === 1 ? "1 discussion" : `${topLevelResponses.length} discussions`
  ];

  if (options.nested) {
    metaChips.push(formatRelativeDate(post.approvedAt || post.createdAt));
  } else {
    metaChips.push(
      approvedSubMusings.length === 1 ? "1 sub-musing" : `${approvedSubMusings.length} sub-musings`
    );
  }

  metaChips.forEach((label) => {
    const chip = document.createElement("span");
    chip.className = "muse-summary-chip";
    chip.textContent = label;
    summaryMeta.appendChild(chip);
  });

  summaryCopy.append(summaryEyebrow, summaryTitle);
  if (summaryExcerpt.textContent) {
    summaryCopy.appendChild(summaryExcerpt);
  }
  summaryCopy.appendChild(summaryMeta);

  const summaryToggle = document.createElement("span");
  summaryToggle.className = "muse-summary-toggle";
  summaryToggle.textContent = options.nested ? "Read follow-up" : "Read muse";

  summary.append(summaryCopy, summaryToggle);
  thread.appendChild(summary);

  const body = document.createElement("div");
  body.className = "muse-thread-body";
  body.appendChild(buildPostCard(post, {
    includeComments: true,
    subMusingCount: approvedSubMusings.length,
    allowComment: options.allowComment,
    allowSignals: options.allowSignals,
    currentUserEmail: options.currentUserEmail || ""
  }));

  if (approvedSubMusings.length > 0) {
    const subMusingSection = document.createElement("section");
    subMusingSection.className = "sub-musing-section";

    const subMusingHeading = document.createElement("h3");
    subMusingHeading.textContent = "Sub-musings";

    const subMusingLead = document.createElement("p");
    subMusingLead.className = "lead compact";
    subMusingLead.textContent = "Open each follow-up to read the approved sub-musing and its own discussions.";

    const subMusingList = document.createElement("div");
    subMusingList.className = "stack-list nested-muse-list";
    approvedSubMusings.forEach((subMusing) => {
      subMusingList.appendChild(buildMusingThread(subMusing, {
        nested: true,
        open: false,
        includeSubMusings: false,
        posts,
        comments,
        allowComment: options.allowComment,
        allowSignals: options.allowSignals,
        currentUserEmail: options.currentUserEmail || ""
      }));
    });

    subMusingSection.append(subMusingHeading, subMusingLead, subMusingList);
    body.appendChild(subMusingSection);
  }

  thread.appendChild(body);
  return thread;
}

function renderUserPosts(session) {
  const feed = document.getElementById("approved-feed");
  const feedEmpty = document.getElementById("feed-empty-state");
  const userPosts = document.getElementById("user-post-list");
  const userEmpty = document.getElementById("user-empty-state");
  const notificationList = document.getElementById("notification-list");
  const notificationEmpty = document.getElementById("notification-empty-state");

  const posts = getPosts();
  const recentWeeklyPosts = getRecentApprovedPosts(posts, 3);
  const mine = session
    ? posts.filter((post) =>
      post.userEmail === session.email &&
      (post.status === "pending" || post.status === "revision_requested")
    )
    : [];
  const dismissedNotifications = getDismissedNotifications();
  const reviewNotifications = session
    ? posts.filter((post) =>
      post.userEmail === session.email &&
      (post.status === "rejected" || post.status === "revision_requested") &&
      !dismissedNotifications.includes(post.id)
    )
    : [];

  if (feed) {
    feed.innerHTML = "";
    const comments = getComments();
    recentWeeklyPosts.forEach((post, index) => {
      feed.appendChild(buildMusingThread(post, {
        open: index === 0,
        posts,
        comments,
        allowComment: session?.role === "user",
        allowSignals: session?.role === "user",
        currentUserEmail: session?.email || ""
      }));
    });
  }

  if (feedEmpty) {
    feedEmpty.hidden = recentWeeklyPosts.length > 0;
  }

  if (notificationList) {
    notificationList.innerHTML = "";
    reviewNotifications.forEach((post) => {
      const card = document.createElement("article");
      card.className = "notification-card";

      const title = document.createElement("h3");
      title.textContent = post.status === "rejected"
        ? `Post rejected: ${post.title}`
        : `Revision requested: ${post.title}`;

      const text = document.createElement("p");
      text.textContent = post.status === "rejected"
        ? "The council rejected this submission. You can submit a new version if needed."
        : "The council requested revision. Please update and resubmit with clearer framing.";

      const meta = document.createElement("div");
      meta.className = "meta-row";
      meta.textContent = post.status === "rejected"
        ? `Rejected ${formatDate(post.rejectedAt)}`
        : `Revision requested ${formatDate(post.revisionRequestedAt)}`;

      const closeButton = document.createElement("button");
      closeButton.type = "button";
      closeButton.className = "secondary notification-close";
      closeButton.textContent = "X";
      closeButton.dataset.action = "dismiss-notification";
      closeButton.dataset.postId = String(post.id);

      card.append(title, text, meta, closeButton);
      notificationList.appendChild(card);
    });
  }

  if (notificationEmpty) {
    notificationEmpty.hidden = reviewNotifications.length > 0;
  }

  if (userPosts) {
    userPosts.innerHTML = "";
    mine.forEach((post) => {
      userPosts.appendChild(buildPostCard(post, { showOwner: true }));
    });
  }

  if (userEmpty) {
    userEmpty.hidden = mine.length > 0;
  }
}

function bindMusingNavigation() {
  const feed = document.getElementById("approved-feed");
  if (!feed) {
    return;
  }

  feed.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const actionSource = target.closest("[data-action='open-sub-musings']");
    if (!(actionSource instanceof HTMLElement)) {
      return;
    }

    const postId = Number(actionSource.dataset.postId);
    if (!postId) {
      return;
    }

    const thread = feed.querySelector(`.muse-thread-card[data-post-id="${postId}"]`);
    if (!(thread instanceof HTMLDetailsElement)) {
      return;
    }

    thread.open = true;

    const subMusingSection = thread.querySelector(".sub-musing-section");
    if (!(subMusingSection instanceof HTMLElement)) {
      return;
    }

    const nestedThreads = subMusingSection.querySelectorAll(".muse-thread-card.is-nested");
    nestedThreads.forEach((node) => {
      if (node instanceof HTMLDetailsElement) {
        node.open = true;
      }
    });

    const streamBlocks = subMusingSection.querySelectorAll(".response-stream");
    streamBlocks.forEach((node) => {
      if (node instanceof HTMLDetailsElement) {
        node.open = true;
      }
    });

    window.requestAnimationFrame(() => {
      subMusingSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function bindThemeSettings() {
  const form = document.getElementById("theme-settings-form");
  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const message = document.getElementById("theme-settings-message");
  const activeThemeName = document.getElementById("active-theme-name");
  const activeThemeDescription = document.getElementById("active-theme-description");

  const syncThemeUi = (themeInput) => {
    const theme = getThemeOption(themeInput);
    const selectedInput = form.querySelector(`input[name="themePreference"][value="${theme.key}"]`);
    if (selectedInput instanceof HTMLInputElement) {
      selectedInput.checked = true;
    }
    if (activeThemeName) {
      activeThemeName.textContent = theme.label;
    }
    if (activeThemeDescription) {
      activeThemeDescription.textContent = theme.description;
    }
  };

  const applyAndPersistTheme = (themeInput, confirmationText) => {
    const theme = saveThemePreference(themeInput);
    applyThemePreference(theme);
    syncThemeUi(theme);
    if (message) {
      message.textContent = confirmationText || `${getThemeOption(theme).label} aesthetic applied to this device.`;
    }
  };

  syncThemeUi(getThemePreference());

  form.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.name !== "themePreference") {
      return;
    }

    const theme = getThemeOption(target.value);
    applyAndPersistTheme(theme.key, `${theme.label} aesthetic applied. Changes are already live.`);
  });

  form.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const resetButton = target.closest("[data-action='reset-theme-preference']");
    if (!resetButton) {
      return;
    }

    event.preventDefault();
    const theme = getThemeOption(DEFAULT_THEME);
    applyAndPersistTheme(theme.key, `${theme.label} aesthetic restored.`);
  });
}

function configureUserPageAccess(session) {
  if (!isUserAreaPage(document.body.dataset.page)) {
    return;
  }

  const isMember = session?.role === "user";
  const taskbar = document.getElementById("bottom-taskbar");
  const logoutButton = document.getElementById("logout-button");
  const loginNavButton = document.getElementById("login-nav-button");
  const submitSection = document.getElementById("submit-section");
  const notificationSection = document.getElementById("notifications-section");
  const suggestionsSection = document.getElementById("my-suggestions-section");
  const memberLead = document.getElementById("member-lead");
  const feedLead = document.getElementById("feed-lead");

  if (logoutButton) {
    logoutButton.hidden = !isMember;
  }
  if (loginNavButton) {
    loginNavButton.hidden = isMember;
  }
  if (submitSection) {
    submitSection.hidden = !isMember;
  }
  if (notificationSection) {
    notificationSection.hidden = !isMember;
  }
  if (suggestionsSection) {
    suggestionsSection.hidden = !isMember;
  }
  if (memberLead) {
    memberLead.textContent = isMember
      ? "Only standard users can stay on this page. Admins are redirected to their dashboard."
      : "You are viewing as a guest. Login to submit musings, respond anonymously, and track council updates.";
  }
  if (feedLead) {
    feedLead.textContent = isMember
      ? "Three recent weekly muses are curated below. Open a muse to browse its sub-musings and discussion streams, use hearts for likes, and open the menu for additional actions."
      : "You can read the last three approved weekly muses without login. Login is required to respond.";
  }
  if (taskbar) {
    taskbar.hidden = !isMember;
  }
  document.body.classList.toggle("has-bottom-taskbar", isMember && Boolean(taskbar));
}

function bindPostSubmission(session) {
  const form = document.getElementById("post-form");
  const message = document.getElementById("post-message");
  if (!form || !message) {
    return;
  }

  const mediaPreviewContainer = document.getElementById("media-upload-preview");
  let activeMediaPreviewUrl = "";
  const clearMediaUploadPreview = () => {
    if (activeMediaPreviewUrl) {
      URL.revokeObjectURL(activeMediaPreviewUrl);
      activeMediaPreviewUrl = "";
    }

    if (mediaPreviewContainer instanceof HTMLElement) {
      mediaPreviewContainer.hidden = true;
      mediaPreviewContainer.innerHTML = "";
    }
  };

  const showMediaUploadPreview = (file) => {
    clearMediaUploadPreview();
    if (!(mediaPreviewContainer instanceof HTMLElement) || !(file instanceof File) || file.size <= 0) {
      return;
    }

    const previewType = inferMediaTypeFromMime(file.type) || inferMediaTypeFromFilename(file.name);
    if (!previewType) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    activeMediaPreviewUrl = previewUrl;

    const wrapper = document.createElement("div");
    wrapper.className = "media-preview upload-preview";
    wrapper.classList.add(previewType);

    if (previewType === "video") {
      const video = document.createElement("video");
      video.controls = true;
      video.preload = "metadata";
      video.playsInline = true;
      video.src = previewUrl;
      wrapper.appendChild(video);
    } else if (previewType === "audio") {
      wrapper.classList.add("audio-only");
      const audio = document.createElement("audio");
      audio.controls = true;
      audio.preload = "metadata";
      audio.src = previewUrl;
      wrapper.appendChild(audio);
    } else {
      const image = document.createElement("img");
      image.loading = "lazy";
      image.alt = file.name ? `Preview of ${file.name}` : "Selected media preview";
      image.src = previewUrl;
      wrapper.appendChild(image);
    }

    const caption = document.createElement("p");
    caption.className = "media-caption";
    caption.textContent = file.name || "Selected media";
    wrapper.appendChild(caption);

    mediaPreviewContainer.appendChild(wrapper);
    mediaPreviewContainer.hidden = false;
  };

  const mediaTypeSelect = form.querySelector('select[name="mediaType"]');
  const mediaFileField = form.querySelector('input[name="mediaFile"]');
  const syncMediaFileAccept = () => {
    if (!(mediaTypeSelect instanceof HTMLSelectElement) || !(mediaFileField instanceof HTMLInputElement)) {
      return;
    }
    const selectedType = normalizeMediaType(mediaTypeSelect.value);
    mediaFileField.accept = MEDIA_ACCEPT_TYPES[selectedType] || "video/*,audio/*,image/*,.gif";
  };

  if (mediaTypeSelect instanceof HTMLSelectElement && mediaFileField instanceof HTMLInputElement) {
    syncMediaFileAccept();
    mediaTypeSelect.addEventListener("change", syncMediaFileAccept);
    mediaFileField.addEventListener("change", () => {
      const selectedFile = mediaFileField.files && mediaFileField.files.length > 0
        ? mediaFileField.files[0]
        : null;
      showMediaUploadPreview(selectedFile);
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const title = String(formData.get("title") || "").trim();
    const content = String(formData.get("content") || "").trim();
    const mediaType = normalizeMediaType(formData.get("mediaType"));
    const mediaFileInput = formData.get("mediaFile");
    const mediaFile = mediaFileInput instanceof File && mediaFileInput.size > 0
      ? mediaFileInput
      : null;
    const whyMatters = String(formData.get("whyMatters") || "").trim();
    const hopedConversation = String(formData.get("hopedConversation") || "").trim();
    const category = String(formData.get("category") || "").trim();
    const sensitivity = String(formData.get("sensitivity") || "").trim();
    const declarationAccepted = formData.get("declaration") === "on";

    if (!title || !content || !mediaType || !whyMatters || !hopedConversation || !category || !sensitivity) {
      message.textContent = "Complete all musing fields before submitting.";
      return;
    }

    if (!declarationAccepted) {
      message.textContent = "You must confirm the reflection declaration.";
      return;
    }

    let mediaDataUrl = "";
    let mediaMimeType = "";
    let mediaName = "";

    if (mediaFile) {
      if (mediaFile.size > MEDIA_UPLOAD_LIMIT_BYTES) {
        message.textContent = "Uploaded media must be 4 MB or smaller.";
        return;
      }

      mediaMimeType = String(mediaFile.type || "").trim().toLowerCase();
      const inferredMediaType = inferMediaTypeFromMime(mediaMimeType) || inferMediaTypeFromFilename(mediaFile.name);
      if (!inferredMediaType) {
        message.textContent = "Unsupported media file. Upload a video, audio, image, or GIF.";
        return;
      }

      if (mediaType !== inferredMediaType) {
        message.textContent = mediaType === "gif"
          ? "GIF media type requires a GIF file."
          : `Selected media type and uploaded file do not match. Upload a ${mediaType} file.`;
        return;
      }

      try {
        mediaDataUrl = await readFileAsDataUrl(mediaFile);
      } catch (error) {
        message.textContent = "Could not read the uploaded media file. Try another file.";
        return;
      }
      mediaName = String(mediaFile.name || "").trim();
    }

    const format = getFormatForMediaType(mediaType);
    const posts = getPosts();
    posts.unshift({
      id: Date.now(),
      userEmail: session.email,
      title,
      content,
      format,
      mediaType,
      mediaMimeType,
      mediaName,
      mediaDataUrl,
      whyMatters,
      hopedConversation,
      category,
      sensitivity,
      declarationAccepted,
      status: "pending",
      approvedBy: null,
      rejectedBy: null,
      revisionRequestedBy: null,
      createdAt: new Date().toISOString(),
      approvedAt: null,
      rejectedAt: null,
      revisionRequestedAt: null
    });

    try {
      savePosts(posts);
    } catch (error) {
      message.textContent = "This media file is too large for browser storage. Try a smaller file.";
      return;
    }

    form.reset();
    syncMediaFileAccept();
    clearMediaUploadPreview();
    message.textContent = "Musing submitted for council review.";
    renderUserPosts(session);
  });
}

function bindAdminModeration(session) {
  const moderationContainers = [
    document.getElementById("admin-post-list"),
    document.getElementById("submuse-request-list")
  ].filter(Boolean);
  if (moderationContainers.length === 0) {
    return;
  }

  const handleModerationClick = (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (!target.dataset.action) {
      return;
    }

    const postId = Number(target.dataset.postId);
    const action = target.dataset.action;
    if (!["approve", "reject", "revise"].includes(String(action || ""))) {
      return;
    }

    const posts = getPosts().map((post) => {
      if (post.id !== postId) {
        return post;
      }

      const now = new Date().toISOString();
      if (action === "approve") {
        return {
          ...post,
          status: "approved",
          approvedBy: session.email,
          approvedAt: now,
          rejectedBy: null,
          rejectedAt: null,
          revisionRequestedBy: null,
          revisionRequestedAt: null
        };
      }

      if (action === "revise") {
        return {
          ...post,
          status: "revision_requested",
          approvedBy: null,
          approvedAt: null,
          rejectedBy: null,
          rejectedAt: null,
          revisionRequestedBy: session.email,
          revisionRequestedAt: now
        };
      }

      return {
        ...post,
        status: "rejected",
        approvedBy: null,
        approvedAt: null,
        rejectedBy: session.email,
        rejectedAt: now,
        revisionRequestedBy: null,
        revisionRequestedAt: null
      };
    });

    savePosts(posts);
    renderAdminPosts();
    renderSubMusingRequests();
    renderFlaggedResponses();
  };

  moderationContainers.forEach((container) => {
    container.addEventListener("click", handleModerationClick);
  });
}

function bindCommentSubmission(session) {
  const feed = document.getElementById("approved-feed");
  if (!feed) {
    return;
  }

  const autosaveTimeoutsByPost = new Map();
  const clearPendingAutosave = (postId) => {
    const key = String(postId);
    const timeoutId = autosaveTimeoutsByPost.get(key);
    if (typeof timeoutId === "number") {
      window.clearTimeout(timeoutId);
      autosaveTimeoutsByPost.delete(key);
    }
  };

  const readDraftFromForm = (form) => {
    if (!(form instanceof HTMLFormElement) || !form.classList.contains("comment-form")) {
      return null;
    }

    const postId = Number(form.dataset.postId);
    if (!Number.isFinite(postId)) {
      return null;
    }

    const textarea = form.querySelector('textarea[name="comment"]');
    const typeSelect = form.querySelector('select[name="responseType"]');
    if (!(textarea instanceof HTMLTextAreaElement) || !(typeSelect instanceof HTMLSelectElement)) {
      return null;
    }

    return {
      postId,
      textarea,
      typeSelect,
      content: String(textarea.value || ""),
      responseType: getResponseTypeOrDefault(typeSelect.value)
    };
  };

  const persistDraftFromForm = (form) => {
    const payload = readDraftFromForm(form);
    if (!payload) {
      return;
    }

    setResponseDraft(payload.postId, session.email, {
      responseType: payload.responseType,
      content: payload.content
    });
  };

  const queueDraftAutosave = (form) => {
    const payload = readDraftFromForm(form);
    if (!payload) {
      return;
    }

    clearPendingAutosave(payload.postId);
    const timeoutId = window.setTimeout(() => {
      autosaveTimeoutsByPost.delete(String(payload.postId));
      try {
        persistDraftFromForm(form);
      } catch (error) {
        // Ignore autosave errors to avoid interrupting typing.
      }
    }, RESPONSE_DRAFT_AUTOSAVE_DELAY_MS);
    autosaveTimeoutsByPost.set(String(payload.postId), timeoutId);
  };

  feed.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const form = target.closest("form.comment-form");
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    queueDraftAutosave(form);
  });

  feed.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const form = target.closest("form.comment-form");
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    queueDraftAutosave(form);
  });

  window.addEventListener("beforeunload", () => {
    autosaveTimeoutsByPost.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    autosaveTimeoutsByPost.clear();

    const forms = feed.querySelectorAll("form.comment-form");
    forms.forEach((form) => {
      try {
        persistDraftFromForm(form);
      } catch (error) {
        // Ignore unload-time draft errors.
      }
    });
  });

  feed.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const actionSource = target.closest("[data-action]");
    if (!(actionSource instanceof HTMLElement)) {
      return;
    }

    const action = String(actionSource.dataset.action || "");
    if (["toggle-reply-form", "cancel-reply-form"].includes(action)) {
      const item = actionSource.closest(".comment-item");
      if (!(item instanceof HTMLElement)) {
        return;
      }

      const replyForm = item.querySelector(".reply-form");
      if (!(replyForm instanceof HTMLFormElement)) {
        return;
      }

      if (action === "cancel-reply-form") {
        replyForm.hidden = true;
        replyForm.reset();
        const replyMessage = replyForm.querySelector(".message");
        if (replyMessage instanceof HTMLElement) {
          replyMessage.textContent = "";
        }
        return;
      }

      replyForm.hidden = !replyForm.hidden;
      if (!replyForm.hidden) {
        const replyField = replyForm.querySelector('textarea[name="comment"]');
        if (replyField instanceof HTMLTextAreaElement) {
          replyField.focus();
        }
      }
      return;
    }

    if (!["save-response-draft", "clear-response-draft"].includes(action)) {
      return;
    }

    const form = actionSource.closest("form.comment-form");
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    const postId = Number(form.dataset.postId);
    if (!Number.isFinite(postId)) {
      return;
    }

    const textarea = form.querySelector('textarea[name="comment"]');
    const typeSelect = form.querySelector('select[name="responseType"]');
    const message = form.querySelector(".message");
    if (!(textarea instanceof HTMLTextAreaElement) || !(typeSelect instanceof HTMLSelectElement)) {
      return;
    }

    if (action === "save-response-draft") {
      clearPendingAutosave(postId);
      const content = String(textarea.value || "");
      if (!content.trim()) {
        if (message instanceof HTMLElement) {
          message.textContent = "Type your response before saving a draft.";
        }
        return;
      }

      try {
        persistDraftFromForm(form);
        if (message instanceof HTMLElement) {
          message.textContent = "Draft saved.";
        }
      } catch (error) {
        if (message instanceof HTMLElement) {
          message.textContent = "Could not save your draft right now.";
        }
      }
      return;
    }

    clearPendingAutosave(postId);
    try {
      clearResponseDraft(postId, session.email);
    } catch (error) {
      if (message instanceof HTMLElement) {
        message.textContent = "Could not clear your draft right now.";
      }
      return;
    }

    textarea.value = "";
    typeSelect.value = DEFAULT_RESPONSE_TYPE;
    if (message instanceof HTMLElement) {
      message.textContent = "Draft cleared.";
    }
  });

  feed.addEventListener("submit", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLFormElement)) {
      return;
    }

    const isTopLevelResponseForm = target.classList.contains("comment-form");
    const isReplyForm = target.classList.contains("reply-form");
    if (!isTopLevelResponseForm && !isReplyForm) {
      return;
    }

    event.preventDefault();
    const formData = new FormData(target);
    const content = String(formData.get("comment") || "").trim();
    const postId = Number(target.dataset.postId);
    const responseType = String(formData.get("responseType") || "").trim();
    const parentResponseId = Number(target.dataset.parentResponseId);
    const message = target.querySelector(".message");
    const wordCount = countWords(content);

    if (!Number.isFinite(postId)) {
      return;
    }
    if (isTopLevelResponseForm) {
      clearPendingAutosave(postId);
    }

    if (!content) {
      if (message instanceof HTMLElement) {
        message.textContent = "Enter your response before submitting.";
      }
      return;
    }

    if (isReplyForm && !Number.isFinite(parentResponseId)) {
      if (message instanceof HTMLElement) {
        message.textContent = "This reply target is unavailable.";
      }
      return;
    }

    if (!isValidResponseType(responseType)) {
      if (message instanceof HTMLElement) {
        message.textContent = "Select a stream before submitting.";
      }
      return;
    }

    if (wordCount > RESPONSE_WORD_LIMIT) {
      if (message instanceof HTMLElement) {
        message.textContent = `Responses are limited to ${RESPONSE_WORD_LIMIT} words.`;
      }
      return;
    }

    const comments = getComments();
    if (isReplyForm) {
      const parentResponse = comments.find((response) =>
        response.id === parentResponseId &&
        response.postId === postId &&
        response.status !== "removed"
      );

      if (!parentResponse) {
        if (message instanceof HTMLElement) {
          message.textContent = "The response you are commenting on is no longer available.";
        }
        return;
      }
    }

    comments.unshift({
      id: Date.now(),
      postId,
      userEmail: session.email,
      responseType,
      parentResponseId: isReplyForm ? parentResponseId : null,
      content,
      likedBy: [],
      resonatedBy: [],
      discussedBy: [],
      flaggedBy: [],
      reports: [],
      likeCount: 0,
      resonatesCount: 0,
      discussCount: 0,
      flagCount: 0,
      status: "active",
      createdAt: new Date().toISOString()
    });
    saveComments(comments);

    if (isTopLevelResponseForm) {
      try {
        clearResponseDraft(postId, session.email);
      } catch (error) {
        // Ignore draft cleanup failure; the response was still submitted successfully.
      }
    }

    target.reset();
    if (isReplyForm) {
      target.hidden = true;
    }
    if (message instanceof HTMLElement) {
      message.textContent = "";
    }
    renderUserPosts(session);
  });
}

function createSubMusingProposal(mainPost, response, session) {
  return {
    id: Date.now(),
    userEmail: session.email,
    title: `Sub-musing: ${mainPost.title}`,
    content: response.content,
    format: "Text sub-musing",
    mediaType: "",
    mediaMimeType: "",
    mediaName: "",
    mediaDataUrl: "",
    whyMatters: `Promoted from a ${getResponseLabel(response.responseType)} response.`,
    hopedConversation: "How should this follow-up insight deepen the main musing conversation?",
    category: mainPost.category || "General",
    sensitivity: mainPost.sensitivity || "medium",
    declarationAccepted: true,
    parentPostId: mainPost.id,
    sourceCommentId: response.id,
    isSubMusing: true,
    promotedBy: session.email,
    promotedAt: new Date().toISOString(),
    status: "pending",
    approvedBy: null,
    rejectedBy: null,
    revisionRequestedBy: null,
    createdAt: new Date().toISOString(),
    approvedAt: null,
    rejectedAt: null,
    revisionRequestedAt: null
  };
}

function bindResponseSignals(session) {
  const feed = document.getElementById("approved-feed");
  if (!feed) {
    return;
  }

  const runResponseAction = (actionSource, actionInput) => {
    const action = String(actionInput || "");
    const commentId = Number(actionSource.dataset.commentId);
    if (!commentId) {
      return;
    }

    if (action === "request-sub-musing") {
      const postId = Number(actionSource.dataset.postId);
      if (!postId) {
        return;
      }

      const userEmail = String(session?.email || "").trim().toLowerCase();
      if (!userEmail) {
        return;
      }
      const posts = getPosts();
      if (hasOpenSubMusingRequest(posts, postId, commentId, userEmail)) {
        renderUserPosts(session);
        return;
      }

      const mainPost = posts.find((post) => post.id === postId);
      const sourceResponse = getComments().find((response) => response.id === commentId);
      if (!mainPost || !sourceResponse) {
        return;
      }

      const proposal = createSubMusingProposal(mainPost, sourceResponse, session);
      posts.unshift(proposal);
      savePosts(posts);
      renderUserPosts(session);
      return;
    }

    if (action === "open-report-form") {
      const item = actionSource.closest(".comment-item");
      if (!(item instanceof HTMLElement)) {
        return;
      }
      const reportForm = item.querySelector(".report-form");
      if (!(reportForm instanceof HTMLFormElement)) {
        return;
      }

      reportForm.hidden = !reportForm.hidden;
      if (!reportForm.hidden) {
        const detailsField = reportForm.querySelector('textarea[name="reportDetails"]');
        if (detailsField instanceof HTMLTextAreaElement) {
          detailsField.focus();
        }
      }
      const actionMenu = actionSource.closest(".action-menu");
      if (actionMenu instanceof HTMLDetailsElement) {
        actionMenu.open = false;
      }
      return;
    }

    const comments = getComments().map((response) => {
      if (response.id !== commentId || response.status === "removed") {
        return response;
      }

      const actorEmail = String(session?.email || "").trim().toLowerCase();
      if (!actorEmail) {
        return response;
      }

      if (action === "like-response") {
        const likedBy = Array.isArray(response.likedBy) ? response.likedBy : [];
        if (likedBy.includes(actorEmail)) {
          return response;
        }
        const nextLikedBy = [...likedBy, actorEmail];
        const preservedCount = Math.max(Number(response.likeCount || 0), likedBy.length);
        return { ...response, likedBy: nextLikedBy, likeCount: preservedCount + 1 };
      }

      if (action === "signal-resonate") {
        const resonatedBy = Array.isArray(response.resonatedBy) ? response.resonatedBy : [];
        if (resonatedBy.includes(actorEmail)) {
          return response;
        }
        const nextResonatedBy = [...resonatedBy, actorEmail];
        const preservedCount = Math.max(Number(response.resonatesCount || 0), resonatedBy.length);
        return { ...response, resonatedBy: nextResonatedBy, resonatesCount: preservedCount + 1 };
      }

      if (action === "signal-discuss") {
        const discussedBy = Array.isArray(response.discussedBy) ? response.discussedBy : [];
        if (discussedBy.includes(actorEmail)) {
          return response;
        }
        const nextDiscussedBy = [...discussedBy, actorEmail];
        const preservedCount = Math.max(Number(response.discussCount || 0), discussedBy.length);
        return { ...response, discussedBy: nextDiscussedBy, discussCount: preservedCount + 1 };
      }

      return response;
    });

    saveComments(comments);
    renderUserPosts(session);
  };

  feed.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const actionSource = target.closest("[data-action]");
    if (!(actionSource instanceof HTMLElement)) {
      return;
    }

    const action = String(actionSource.dataset.action || "");
    if (![
      "signal-resonate",
      "signal-discuss",
      "open-report-form",
      "like-response",
      "request-sub-musing"
    ].includes(action)) {
      return;
    }

    runResponseAction(actionSource, action);
  });

  feed.addEventListener("submit", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLFormElement) || !target.classList.contains("report-form")) {
      return;
    }

    event.preventDefault();
    const commentId = Number(target.dataset.commentId);
    if (!commentId) {
      return;
    }

    const actorEmail = String(session?.email || "").trim().toLowerCase();
    if (!actorEmail) {
      return;
    }

    const formData = new FormData(target);
    const reason = String(formData.get("reportReason") || "").trim();
    const urgency = String(formData.get("reportUrgency") || "").trim();
    const details = String(formData.get("reportDetails") || "").trim();
    const message = target.querySelector(".message");

    if (!isValidReportReason(reason)) {
      if (message instanceof HTMLElement) {
        message.textContent = "Select a reason type before submitting your report.";
      }
      return;
    }

    if (!isValidReportUrgency(urgency)) {
      if (message instanceof HTMLElement) {
        message.textContent = "Select a review urgency level.";
      }
      return;
    }

    if (details.length < REPORT_DETAIL_MIN_CHARS) {
      if (message instanceof HTMLElement) {
        message.textContent = `Please provide at least ${REPORT_DETAIL_MIN_CHARS} characters describing the issue.`;
      }
      return;
    }

    const comments = getComments().map((response) => {
      if (response.id !== commentId || response.status === "removed") {
        return response;
      }

      const reports = getResponseReports(response);
      if (reports.some((report) => report.reporterEmail === actorEmail)) {
        return response;
      }

      const nextReports = [
        ...reports,
        {
          id: Date.now(),
          reporterEmail: actorEmail,
          reason,
          urgency,
          details,
          createdAt: new Date().toISOString()
        }
      ];
      const nextFlaggedBy = nextReports.map((report) => report.reporterEmail);
      return {
        ...response,
        reports: nextReports,
        flaggedBy: nextFlaggedBy,
        flagCount: nextReports.length
      };
    });

    saveComments(comments);
    renderUserPosts(session);
  });
}

function bindFlaggedResponseModeration() {
  const container = document.getElementById("flagged-response-list");
  if (!container) {
    return;
  }

  container.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const actionSource = target.closest("[data-action]");
    if (!(actionSource instanceof HTMLElement)) {
      return;
    }

    const action = actionSource.dataset.action;
    if (!["flag-keep", "flag-remove"].includes(String(action || ""))) {
      return;
    }

    const commentId = Number(actionSource.dataset.commentId);
    if (!commentId) {
      return;
    }

    const comments = getComments().map((response) => {
      if (response.id !== commentId) {
        return response;
      }

      if (action === "flag-remove") {
        return { ...response, status: "removed" };
      }
      return { ...response, flagCount: 0, flaggedBy: [], reports: [] };
    });

    saveComments(comments);
    renderFlaggedResponses();
  });
}

function bindNotificationDismissal() {
  const notificationList = document.getElementById("notification-list");
  if (!notificationList) {
    return;
  }

  notificationList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || target.dataset.action !== "dismiss-notification") {
      return;
    }

    const postId = Number(target.dataset.postId);
    const dismissed = getDismissedNotifications();
    if (!dismissed.includes(postId)) {
      dismissed.push(postId);
      saveDismissedNotifications(dismissed);
    }

    const session = getSession();
    if (session) {
      renderUserPosts(session);
    }
  });
}

function bindGuestLoginModal() {
  if (document.body.dataset.page !== "user") {
    return;
  }

  const modal = document.getElementById("guest-login-modal");
  const form = document.getElementById("guest-login-form");
  const message = document.getElementById("guest-login-message");
  if (!modal || !form || !message) {
    return;
  }
  const feed = document.getElementById("approved-feed");
  const closeTriggers = modal.querySelectorAll("[data-action='close-login-modal']");

  const openModal = () => {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    message.textContent = "";
    form.reset();
    const emailInput = form.querySelector("input[name='email']");
    if (emailInput instanceof HTMLInputElement) {
      emailInput.focus();
    }
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  if (feed) {
    feed.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const trigger = target.closest("[data-action='open-login-modal']");
      if (!trigger) {
        return;
      }

      openModal();
    });
  }

  for (let i = 0; i < closeTriggers.length; i += 1) {
    const trigger = closeTriggers[i];
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeModal();
    });
  }

  modal.addEventListener("click", (event) => {
    const target = event.target;
    const clickedBackdrop = target === modal;
    const eventPath = typeof event.composedPath === "function" ? event.composedPath() : [];
    const clickedCloseFromPath = eventPath.some((node) =>
      node instanceof Element && node.getAttribute("data-action") === "close-login-modal"
    );
    const clickedCloseFromTarget = target instanceof Element && Boolean(target.closest("[data-action='close-login-modal']"));
    if (clickedBackdrop || clickedCloseFromPath || clickedCloseFromTarget) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const account = authenticateUser(formData.get("email"), formData.get("password"));
    if (!account) {
      message.textContent = "Invalid email or password.";
      return;
    }

    setSession(account);
    window.location.href = account.redirect;
  });
}

function initializePageFeatures() {
  const page = document.body.dataset.page;
  const session = getSession();

  if (page === "admin") {
    if (!session) {
      return;
    }
    renderAdminPosts();
    renderSubMusingRequests();
    renderFlaggedResponses();
    bindAdminModeration(session);
    bindFlaggedResponseModeration();
  }

  if (isUserAreaPage(page)) {
    configureUserPageAccess(session);
  }

  if (page === "user") {
    renderUserPosts(session);
    bindGuestLoginModal();
    bindMusingNavigation();

    if (session?.role === "user") {
      bindCommentSubmission(session);
      bindResponseSignals(session);
    }
  }

  if (page === "user-settings") {
    bindThemeSettings();
  }

  if (page === "user-suggestion") {
    renderUserPosts(session);

    if (session?.role === "user") {
      bindPostSubmission(session);
      bindNotificationDismissal();
    }
  }
}

ensureAccounts();
ensurePosts();
ensureComments();
ensureDismissedNotifications();
ensureResponseDrafts();
applyThemePreference();
guardPage();
bindLogin();
bindSignup();
bindLogout();
initializePageFeatures();
