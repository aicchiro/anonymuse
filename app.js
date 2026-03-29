const ACCOUNT_STORAGE_KEY = "anonymuse.accounts";
const SESSION_STORAGE_KEY = "anonymuse.session";
const POST_STORAGE_KEY = "anonymuse.posts";
const COMMENT_STORAGE_KEY = "anonymuse.comments";
const DISMISSED_NOTIFICATION_STORAGE_KEY = "anonymuse.dismissedNotifications";
const RESPONSE_DRAFT_STORAGE_KEY = "anonymuse.responseDrafts";
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
    id: 1,
    userEmail: "user@test.com",
    title: "What does silence protect in a group conversation?",
    content: "In this week's reflection, we notice how silence can be both refuge and avoidance. The question is not who failed to speak, but what the silence was holding in place and what it cost the room.",
    format: "One-minute audio reflection",
    whyMatters: "Silence in spiritual spaces can reveal both wisdom and fear. Naming it helps communities discern what is happening beneath the surface.",
    hopedConversation: "How do we distinguish healthy silence from avoidance in church culture?",
    category: "Church culture",
    sensitivity: "medium",
    declarationAccepted: true,
    status: "approved",
    approvedBy: "admin@test.com",
    createdAt: "2026-03-24T09:00:00.000Z",
    approvedAt: "2026-03-24T09:15:00.000Z"
  },
  {
    id: 2,
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
  }
];

const seedComments = [
  {
    id: 1,
    postId: 1,
    userEmail: "user@test.com",
    responseType: "resonates",
    parentResponseId: null,
    content: "Glad this one made it into the feed.",
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
    createdAt: "2026-03-24T10:30:00.000Z"
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
    const normalized = parsed.map((post) => normalizePost(post));
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
    const normalized = parsed.map((comment) => normalizeResponse(comment));
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

  if (page === "user" && session?.role === "admin") {
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

function getLatestApprovedPost(posts) {
  return posts
    .filter((post) => post.status === "approved" && !post.parentPostId)
    .sort((first, second) => {
      const firstDate = new Date(first.approvedAt || first.createdAt).getTime();
      const secondDate = new Date(second.approvedAt || second.createdAt).getTime();
      return secondDate - firstDate;
    })[0] || null;
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
  if (post.parentPostId) {
    card.classList.add("sub-musing-card");
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

  card.append(title, formatLine, content);

  const mediaPreview = buildMediaPreview(post);
  if (mediaPreview) {
    card.appendChild(mediaPreview);
  }

  if (post.parentPostId) {
    const subMusingLine = document.createElement("p");
    subMusingLine.className = "meta-row";
    subMusingLine.textContent = post.promotedBy
      ? `Sub-muse requested by ${post.promotedBy}`
      : "Sub-muse linked to the main musing";
    card.appendChild(subMusingLine);
  }

  if (post.whyMatters) {
    const whyMatters = document.createElement("p");
    whyMatters.className = "lead compact";
    whyMatters.textContent = `Why this matters: ${post.whyMatters}`;
    card.appendChild(whyMatters);
  }

  if (post.hopedConversation) {
    const hopedConversation = document.createElement("p");
    hopedConversation.className = "lead compact";
    hopedConversation.textContent = `Conversation prompt: ${post.hopedConversation}`;
    card.appendChild(hopedConversation);
  }

  card.append(metadataLine, meta);

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
    card.appendChild(actions);
  }

  if (options.includeComments) {
    const responses = getComments().filter((comment) =>
      comment.postId === post.id &&
      comment.status !== "removed"
    );
    const topLevelResponses = responses.filter((response) => response.parentResponseId === null);
    const posts = getPosts();
    const streamGrid = document.createElement("div");
    streamGrid.className = "response-stream-grid";

    RESPONSE_STREAMS.forEach((stream) => {
      const streamBlock = document.createElement("section");
      streamBlock.className = "response-stream";

      const streamTitle = document.createElement("h4");
      streamTitle.textContent = `Top ${stream.label}`;
      streamBlock.appendChild(streamTitle);

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

          const text = document.createElement("p");
          text.textContent = response.content;

          const metaText = document.createElement("span");
          metaText.className = "meta-row";
          metaText.textContent = `Anonymous response | ${formatDate(response.createdAt)}`;

          const signals = document.createElement("span");
          signals.className = "meta-row";
          signals.textContent = `${response.likeCount} \u2665 | ${response.resonatesCount} resonates | ${response.discussCount} discuss | ${response.flagCount} reports`;

          item.append(text, metaText, signals);

          if (options.allowSignals) {
            const userEmail = String(options.currentUserEmail || "").toLowerCase();
            const reports = getResponseReports(response);
            const hasLikedResponse = Boolean(userEmail) && Array.isArray(response.likedBy) && response.likedBy.includes(userEmail);
            const hasResonated = Boolean(userEmail) && Array.isArray(response.resonatedBy) && response.resonatedBy.includes(userEmail);
            const hasDiscussed = Boolean(userEmail) && Array.isArray(response.discussedBy) && response.discussedBy.includes(userEmail);
            const hasReported = Boolean(userEmail) && reports.some((report) => report.reporterEmail === userEmail);
            const signalRow = document.createElement("div");
            signalRow.className = "actions-row compact-actions";

            const resonateButton = document.createElement("button");
            resonateButton.type = "button";
            resonateButton.className = "secondary";
            resonateButton.dataset.action = "signal-resonate";
            resonateButton.dataset.commentId = String(response.id);
            resonateButton.textContent = hasResonated ? "Resonated" : "Resonates";
            resonateButton.disabled = hasResonated;

            const discussButton = document.createElement("button");
            discussButton.type = "button";
            discussButton.className = "secondary";
            discussButton.dataset.action = "signal-discuss";
            discussButton.dataset.commentId = String(response.id);
            discussButton.textContent = hasDiscussed ? "Marked Discuss" : "Worth discussing";
            discussButton.disabled = hasDiscussed;

            const reportButton = document.createElement("button");
            reportButton.type = "button";
            reportButton.className = "secondary";
            reportButton.dataset.action = "open-report-form";
            reportButton.dataset.commentId = String(response.id);
            reportButton.textContent = hasReported ? "Reported" : "Report concern";
            reportButton.disabled = hasReported;

            const likeButton = document.createElement("button");
            likeButton.type = "button";
            likeButton.className = "secondary";
            likeButton.dataset.action = "like-response";
            likeButton.dataset.commentId = String(response.id);
            likeButton.textContent = hasLikedResponse ? "\u2665 Liked" : "\u2661 Like";
            likeButton.disabled = hasLikedResponse;

            const actionMenu = document.createElement("details");
            actionMenu.className = "action-menu";

            const menuToggle = document.createElement("summary");
            menuToggle.className = "menu-toggle";
            menuToggle.textContent = "\u2630";

            const menuPanel = document.createElement("div");
            menuPanel.className = "menu-panel";
            menuPanel.append(resonateButton, discussButton, reportButton);

            if (!post.parentPostId) {
              const requestSubMusingButton = document.createElement("button");
              requestSubMusingButton.type = "button";
              requestSubMusingButton.className = "secondary";
              requestSubMusingButton.dataset.action = "request-sub-musing";
              requestSubMusingButton.dataset.postId = String(post.id);
              requestSubMusingButton.dataset.commentId = String(response.id);

              const alreadyRequested = hasOpenSubMusingRequest(posts, post.id, response.id, userEmail);
              requestSubMusingButton.disabled = alreadyRequested;
              requestSubMusingButton.textContent = alreadyRequested ? "Sent To Admin" : "Further To Admin";
              menuPanel.appendChild(requestSubMusingButton);
            }

            actionMenu.append(menuToggle, menuPanel);
            signalRow.append(likeButton, actionMenu);
            item.appendChild(signalRow);

            if (hasReported) {
              const alreadyReported = document.createElement("p");
              alreadyReported.className = "meta-row";
              alreadyReported.textContent = "You have already submitted a report for this response.";
              item.appendChild(alreadyReported);
            } else {
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
          }

          streamBlock.appendChild(item);
        });
      }

      streamGrid.appendChild(streamBlock);
    });

    card.appendChild(streamGrid);

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
      card.append(form);
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
      card.append(guestPrompt);
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

function renderUserPosts(session) {
  const feed = document.getElementById("approved-feed");
  const feedEmpty = document.getElementById("feed-empty-state");
  const userPosts = document.getElementById("user-post-list");
  const userEmpty = document.getElementById("user-empty-state");
  const notificationList = document.getElementById("notification-list");
  const notificationEmpty = document.getElementById("notification-empty-state");

  if (!feed || !feedEmpty || !userPosts || !userEmpty || !notificationList || !notificationEmpty) {
    return;
  }

  const posts = getPosts();
  const weeklyPost = getLatestApprovedPost(posts);
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

  feed.innerHTML = "";
  if (weeklyPost) {
    feed.appendChild(buildPostCard(weeklyPost, {
      includeComments: true,
      allowComment: session?.role === "user",
      allowSignals: session?.role === "user",
      currentUserEmail: session?.email || ""
    }));

    const approvedSubMusings = getApprovedSubMusings(posts, weeklyPost.id);
    if (approvedSubMusings.length > 0) {
      const subMusingSection = document.createElement("section");
      subMusingSection.className = "sub-musing-section";

      const subMusingHeading = document.createElement("h3");
      subMusingHeading.textContent = "Sub-musings";

      const subMusingLead = document.createElement("p");
      subMusingLead.className = "lead compact";
      subMusingLead.textContent = "Follow-up musings approved by council based on community response.";

      const subMusingList = document.createElement("div");
      subMusingList.className = "stack-list";
      approvedSubMusings.forEach((subMusing) => {
        subMusingList.appendChild(buildPostCard(subMusing, {
          includeComments: true,
          allowComment: session?.role === "user",
          allowSignals: session?.role === "user",
          currentUserEmail: session?.email || ""
        }));
      });

      subMusingSection.append(subMusingHeading, subMusingLead, subMusingList);
      feed.appendChild(subMusingSection);
    }
  }
  feedEmpty.hidden = Boolean(weeklyPost);

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
  notificationEmpty.hidden = reviewNotifications.length > 0;

  userPosts.innerHTML = "";
  mine.forEach((post) => {
    userPosts.appendChild(buildPostCard(post, { showOwner: true }));
  });
  userEmpty.hidden = mine.length > 0;
}

function configureUserPageAccess(session) {
  if (document.body.dataset.page !== "user") {
    return;
  }

  const isMember = session?.role === "user";
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
      ? "One weekly musing is curated below. Respond in structured streams, use hearts for likes, and open the menu for additional actions."
      : "You can read the weekly musing without login. Login is required to respond.";
  }
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
    if (!(target instanceof HTMLFormElement) || !target.classList.contains("comment-form")) {
      return;
    }

    event.preventDefault();
    const formData = new FormData(target);
    const content = String(formData.get("comment") || "").trim();
    const postId = Number(target.dataset.postId);
    const responseType = String(formData.get("responseType") || "").trim();
    const message = target.querySelector(".message");
    const wordCount = countWords(content);

    if (!Number.isFinite(postId)) {
      return;
    }
    clearPendingAutosave(postId);

    if (!content) {
      if (message instanceof HTMLElement) {
        message.textContent = "Enter your response before submitting.";
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
    comments.unshift({
      id: Date.now(),
      postId,
      userEmail: session.email,
      responseType,
      parentResponseId: null,
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

    try {
      clearResponseDraft(postId, session.email);
    } catch (error) {
      // Ignore draft cleanup failure; the response was still submitted successfully.
    }

    target.reset();
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

  feed.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const actionSource = target.closest("[data-action]");
    if (!(actionSource instanceof HTMLElement)) {
      return;
    }

    const action = actionSource.dataset.action;
    if (![
      "signal-resonate",
      "signal-discuss",
      "open-report-form",
      "like-response",
      "request-sub-musing"
    ].includes(String(action || ""))) {
      return;
    }

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

  if (page === "user") {
    configureUserPageAccess(session);
    renderUserPosts(session);
    bindGuestLoginModal();

    if (session?.role === "user") {
      bindPostSubmission(session);
      bindCommentSubmission(session);
      bindResponseSignals(session);
      bindNotificationDismissal();
    }
  }
}

ensureAccounts();
ensurePosts();
ensureComments();
ensureDismissedNotifications();
ensureResponseDrafts();
guardPage();
bindLogin();
bindSignup();
bindLogout();
initializePageFeatures();
