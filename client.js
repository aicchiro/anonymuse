const THEME_STORAGE_KEY = "anonymuse.theme";
const DEFAULT_THEME = "hearth";
const DEFAULT_RESPONSE_TYPE = "resonates";
const RESPONSE_WORD_LIMIT = 300;
const REPORT_DETAIL_MIN_CHARS = 30;
const MEDIA_UPLOAD_LIMIT_BYTES = 4 * 1024 * 1024;
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

const appState = {
  session: null,
  posts: [],
  comments: [],
  bookmarks: [],
  dismissedNotifications: [],
  responseDrafts: {},
  settings: {
    theme: DEFAULT_THEME,
    reviewUpdatesEnabled: true,
    weeklyDigestEnabled: false,
    defaultFeedSort: "recent",
    hideHighSensitivity: false
  }
};

const uiState = {
  feed: {
    search: "",
    category: "all",
    sort: "",
    bookmarksOnly: false
  },
  editingPostId: null,
  mediaPreviewUrl: "",
  profileAvatarDraft: undefined
};

function getPage() {
  return String(document.body.dataset.page || "");
}

function isUserAreaPage(page = getPage()) {
  return ["user", "user-settings", "user-suggestion"].includes(page);
}

function el(tag, options = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(options).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    if (key === "className") {
      node.className = value;
      return;
    }
    if (key === "text") {
      node.textContent = String(value);
      return;
    }
    if (key === "html") {
      node.innerHTML = String(value);
      return;
    }
    if (key === "dataset" && value && typeof value === "object") {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        node.dataset[dataKey] = String(dataValue);
      });
      return;
    }
    if (key === "attrs" && value && typeof value === "object") {
      Object.entries(value).forEach(([attrKey, attrValue]) => {
        node.setAttribute(attrKey, String(attrValue));
      });
      return;
    }
    if (key === "hidden") {
      node.hidden = Boolean(value);
      return;
    }
    if (key in node) {
      node[key] = value;
      return;
    }
    node.setAttribute(key, String(value));
  });

  children.flat().forEach((child) => {
    if (child === undefined || child === null || child === false) {
      return;
    }
    if (typeof child === "string") {
      node.appendChild(document.createTextNode(child));
      return;
    }
    node.appendChild(child);
  });
  return node;
}

function clearElement(node) {
  if (!node) {
    return;
  }
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function getThemeOption(themeInput) {
  return THEME_OPTIONS.find((option) => option.key === themeInput) || THEME_OPTIONS[0];
}

function getStoredTheme() {
  try {
    return String(localStorage.getItem(THEME_STORAGE_KEY) || "").trim() || DEFAULT_THEME;
  } catch (error) {
    return DEFAULT_THEME;
  }
}

function saveStoredTheme(themeInput) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, getThemeOption(themeInput).key);
  } catch (error) {}
}

function applyThemePreference(themeInput) {
  const theme = getThemeOption(themeInput).key;
  document.documentElement.dataset.theme = theme;
  saveStoredTheme(theme);
}

function hydrateState(payload) {
  appState.session = payload?.session || null;
  appState.posts = Array.isArray(payload?.posts) ? payload.posts : [];
  appState.comments = Array.isArray(payload?.comments) ? payload.comments : [];
  appState.bookmarks = Array.isArray(payload?.bookmarks) ? payload.bookmarks : [];
  appState.dismissedNotifications = Array.isArray(payload?.dismissedNotifications) ? payload.dismissedNotifications : [];
  appState.responseDrafts = payload?.responseDrafts && typeof payload.responseDrafts === "object"
    ? payload.responseDrafts
    : {};
  appState.settings = {
    ...appState.settings,
    ...(payload?.settings || {})
  };

  if (!uiState.feed.sort) {
    uiState.feed.sort = appState.settings.defaultFeedSort || "recent";
  }

  if (appState.session?.role === "user") {
    applyThemePreference(appState.settings.theme || DEFAULT_THEME);
  } else {
    applyThemePreference(getStoredTheme());
  }
}

async function apiRequest(path, options = {}) {
  const requestOptions = {
    method: options.method || "GET",
    headers: {},
    credentials: "same-origin"
  };
  if (options.body !== undefined) {
    requestOptions.headers["Content-Type"] = "application/json";
    requestOptions.body = JSON.stringify(options.body);
  }
  const response = await fetch(path, requestOptions);
  let payload = {};
  try {
    payload = await response.json();
  } catch (error) {}
  if (!response.ok) {
    throw new Error(payload?.error || "Request failed.");
  }
  return payload;
}

async function refreshFromApi(path, options = {}) {
  const payload = await apiRequest(path, options);
  hydrateState(payload);
  guardPage();
  renderCurrentPage();
  return payload;
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

function countWords(value) {
  return String(value || "").trim().split(/\s+/).filter(Boolean).length;
}

function getSessionDisplayName() {
  const fallback = String(appState.session?.email || "Member").split("@", 1)[0] || "Member";
  return String(appState.session?.displayName || "").trim() || fallback;
}

function getInitials(nameInput) {
  const cleaned = String(nameInput || "").trim();
  if (!cleaned) {
    return "M";
  }
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function populateAvatar(container, { name, avatarDataUrl, shellClassName = "profile-avatar-shell" }) {
  if (!(container instanceof HTMLElement)) {
    return;
  }
  container.className = shellClassName;
  container.innerHTML = "";
  if (String(avatarDataUrl || "").trim()) {
    container.appendChild(el("img", {
      src: avatarDataUrl,
      alt: name ? `${name} profile picture` : "Profile picture"
    }));
    return;
  }
  container.textContent = getInitials(name);
}

function getSummaryExcerpt(post, maxLength = 170) {
  const source = String(post.content || post.whyMatters || post.hopedConversation || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!source) {
    return "";
  }
  return source.length <= maxLength ? source : `${source.slice(0, maxLength).trimEnd()}...`;
}

function normalizeMediaType(value) {
  const mediaType = String(value || "").trim().toLowerCase();
  return MEDIA_TYPES.has(mediaType) ? mediaType : "";
}

const MEDIA_TYPES = new Set(["video", "audio", "image", "gif"]);

function inferMediaTypeFromMime(mimeTypeInput) {
  const mimeType = String(mimeTypeInput || "").trim().toLowerCase();
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
  if (format.includes("gif")) return "gif";
  if (format.includes("video")) return "video";
  if (format.includes("audio")) return "audio";
  if (format.includes("image")) return "image";
  return "";
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
  const wrapper = el("div", { className: `media-preview ${mediaType}${mediaType === "audio" ? " audio-only" : ""}` });
  if (mediaType === "video") {
    wrapper.appendChild(el("video", { controls: true, preload: "metadata", playsInline: true, src: mediaDataUrl }));
  } else if (mediaType === "audio") {
    wrapper.appendChild(el("audio", { controls: true, preload: "metadata", src: mediaDataUrl }));
  } else {
    wrapper.appendChild(el("img", {
      src: mediaDataUrl,
      loading: "lazy",
      alt: post.title ? `Attached media for ${post.title}` : "Attached media"
    }));
  }
  if (post.mediaName) {
    wrapper.appendChild(el("p", { className: "media-caption", text: post.mediaName }));
  }
  return wrapper;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Unable to read the selected file."));
    reader.readAsDataURL(file);
  });
}

function getResponseLabel(responseType) {
  return RESPONSE_STREAMS.find((entry) => entry.key === responseType)?.label || "Response";
}

function getReportReasonLabel(reason) {
  return REPORT_REASON_OPTIONS.find((entry) => entry.key === reason)?.label || "Other serious concern";
}

function getReportUrgencyLabel(urgency) {
  return REPORT_URGENCY_OPTIONS.find((entry) => entry.key === urgency)?.label || "Medium urgency";
}

function isBookmarked(postId) {
  return appState.bookmarks.includes(Number(postId));
}

function getResponseDraft(postId) {
  return appState.responseDrafts[String(postId)] || {
    responseType: DEFAULT_RESPONSE_TYPE,
    content: ""
  };
}

function getApprovedMainPosts() {
  return appState.posts
    .filter((post) => post.status === "approved" && !post.parentPostId)
    .sort((first, second) => new Date(second.approvedAt || second.createdAt) - new Date(first.approvedAt || first.createdAt));
}

function getApprovedSubMusings(parentPostId) {
  return appState.posts
    .filter((post) => post.status === "approved" && Number(post.parentPostId) === Number(parentPostId))
    .sort((first, second) => new Date(first.approvedAt || first.createdAt) - new Date(second.approvedAt || second.createdAt));
}

function getTopLevelResponsesForPost(postId) {
  return appState.comments
    .filter((comment) => Number(comment.postId) === Number(postId) && comment.status !== "removed" && comment.parentResponseId === null);
}

function getChildResponses(parentResponseId) {
  return appState.comments
    .filter((comment) => Number(comment.parentResponseId) === Number(parentResponseId) && comment.status !== "removed")
    .sort((first, second) => new Date(first.createdAt) - new Date(second.createdAt));
}

function getResponseScore(response) {
  return (response.resonatesCount * 2) + response.discussCount + response.likeCount - (response.flagCount * 2);
}

function getAllResponsesForPost(postId) {
  return appState.comments.filter((comment) => Number(comment.postId) === Number(postId) && comment.status !== "removed");
}

function getPostDepth(postId) {
  return getAllResponsesForPost(postId).reduce((sum, response) => sum + Math.max(0, getResponseScore(response)), 0);
}

function getFeedDiscussionCount(postId) {
  return getTopLevelResponsesForPost(postId).length;
}

function getFeedCategories() {
  return [...new Set(getApprovedMainPosts().map((post) => post.category || "General"))].sort((a, b) => a.localeCompare(b));
}

function getVisibleFeedPosts() {
  let posts = getApprovedMainPosts();
  if (appState.settings.hideHighSensitivity) {
    posts = posts.filter((post) => post.sensitivity !== "high");
  }
  if (uiState.feed.bookmarksOnly) {
    posts = posts.filter((post) => isBookmarked(post.id));
  }
  if (uiState.feed.category !== "all") {
    posts = posts.filter((post) => (post.category || "General") === uiState.feed.category);
  }
  if (uiState.feed.search.trim()) {
    const search = uiState.feed.search.trim().toLowerCase();
    posts = posts.filter((post) => [post.title, post.content, post.whyMatters, post.hopedConversation, post.category]
      .join(" ")
      .toLowerCase()
      .includes(search));
  }
  const sortKey = uiState.feed.sort || "recent";
  posts.sort((first, second) => {
    if (sortKey === "oldest") {
      return new Date(first.approvedAt || first.createdAt) - new Date(second.approvedAt || second.createdAt);
    }
    if (sortKey === "depth") {
      return getPostDepth(second.id) - getPostDepth(first.id);
    }
    if (sortKey === "discussion") {
      return getFeedDiscussionCount(second.id) - getFeedDiscussionCount(first.id);
    }
    return new Date(second.approvedAt || second.createdAt) - new Date(first.approvedAt || first.createdAt);
  });
  return posts;
}

function buildGuestPrompt() {
  return el("div", { className: "guest-login-prompt" },
    el("p", { className: "empty-state", text: "Login to respond anonymously, save musings, and forward sub-musings to the council." }),
    el("button", {
      type: "button",
      className: "secondary",
      text: "Login to participate",
      dataset: { action: "open-login-modal" }
    })
  );
}

function buildReplyForm(postId, parentResponseId) {
  return el("form", {
    className: "reply-form",
    hidden: true,
    dataset: { postId, parentResponseId }
  },
    el("label", {},
      el("span", { text: "Add a comment" }),
      el("textarea", { name: "comment", rows: 3, placeholder: "Write a respectful follow-up comment" })
    ),
    el("div", { className: "actions-row compact-actions" },
      el("button", { type: "submit", text: "Post comment" }),
      el("button", {
        type: "button",
        className: "secondary",
        text: "Cancel",
        dataset: { action: "toggle-reply-form" }
      })
    ),
    el("p", { className: "message", attrs: { "aria-live": "polite" } })
  );
}

function buildReportForm(commentId) {
  const reasonSelect = el("select", { name: "reason" },
    ...REPORT_REASON_OPTIONS.map((option) => el("option", { value: option.key, text: option.label }))
  );
  const urgencySelect = el("select", { name: "urgency" },
    ...REPORT_URGENCY_OPTIONS.map((option) => el("option", { value: option.key, text: option.label }))
  );
  urgencySelect.value = "medium";
  return el("form", {
    className: "report-form",
    hidden: true,
    dataset: { commentId }
  },
    el("label", {}, el("span", { text: "Reason" }), reasonSelect),
    el("label", {}, el("span", { text: "Urgency" }), urgencySelect),
    el("label", {},
      el("span", { text: "What should the council know?" }),
      el("textarea", { name: "details", rows: 4, placeholder: "Describe the issue with enough detail for review." })
    ),
    el("div", { className: "actions-row compact-actions" },
      el("button", { type: "submit", text: "Submit report" }),
      el("button", {
        type: "button",
        className: "secondary",
        text: "Cancel",
        dataset: { action: "toggle-report-form" }
      })
    ),
    el("p", { className: "message", attrs: { "aria-live": "polite" } })
  );
}

function buildTopResponseItem(response, post) {
  const userEmail = String(appState.session?.email || "").toLowerCase();
  const replies = getChildResponses(response.id);
  const hasLiked = userEmail && response.likedBy.includes(userEmail);
  const hasResonated = userEmail && response.resonatedBy.includes(userEmail);
  const hasDiscussed = userEmail && response.discussedBy.includes(userEmail);
  const hasReported = userEmail && response.reports.some((report) => report.reporterEmail === userEmail);

  const item = el("div", { className: "comment-item", dataset: { commentId: response.id } },
    el("p", { text: response.content }),
    el("span", { className: "meta-row", text: `Anonymous response | ${formatDate(response.createdAt)}` }),
    el("span", {
      className: "meta-row",
      text: `${response.likeCount} likes | ${response.resonatesCount} resonates | ${response.discussCount} discuss | ${response.flagCount} reports`
    })
  );

  if (replies.length > 0) {
    const replyList = el("div", { className: "response-reply-list" });
    replies.forEach((reply) => {
      replyList.appendChild(
        el("div", { className: "response-reply-item" },
          el("p", { text: reply.content }),
          el("span", { className: "meta-row", text: `Anonymous comment | ${formatDate(reply.createdAt)}` })
        )
      );
    });
    item.appendChild(replyList);
  }

  if (appState.session?.role === "user") {
    item.appendChild(
      el("div", { className: "actions-row compact-actions" },
        el("button", {
          type: "button",
          className: "secondary",
          text: hasLiked ? "Liked" : "Like",
          disabled: hasLiked,
          dataset: { action: "like-response", commentId: response.id }
        }),
        el("button", {
          type: "button",
          className: "secondary",
          text: hasResonated ? "Resonated" : "Resonates",
          disabled: hasResonated,
          dataset: { action: "signal-resonate", commentId: response.id }
        }),
        el("button", {
          type: "button",
          className: "secondary",
          text: hasDiscussed ? "Worth discussing" : "Discuss",
          disabled: hasDiscussed,
          dataset: { action: "signal-discuss", commentId: response.id }
        }),
        el("button", {
          type: "button",
          className: "secondary",
          text: replies.length > 0 ? `Comment (${replies.length})` : "Comment",
          dataset: { action: "toggle-reply-form" }
        }),
        el("button", {
          type: "button",
          className: "secondary",
          text: hasReported ? "Reported" : "Report concern",
          disabled: hasReported,
          dataset: { action: "toggle-report-form" }
        }),
        !post.parentPostId
          ? el("button", {
            type: "button",
            className: "secondary",
            text: "Forward to council",
            dataset: { action: "request-sub-musing", commentId: response.id }
          })
          : null
      )
    );
    item.appendChild(buildReplyForm(post.id, response.id));
    item.appendChild(buildReportForm(response.id));
  }

  return item;
}

function buildResponseStream(stream, post) {
  const topResponses = getTopLevelResponsesForPost(post.id)
    .filter((response) => response.responseType === stream.key)
    .sort((first, second) => {
      const scoreDiff = getResponseScore(second) - getResponseScore(first);
      return scoreDiff !== 0 ? scoreDiff : new Date(second.createdAt) - new Date(first.createdAt);
    });
  const block = el("details", { className: "response-stream" },
    el("summary", { className: "response-stream-summary" },
      el("span", { className: "response-stream-title", text: `Top ${stream.label}` }),
      el("span", {
        className: "response-stream-count",
        text: topResponses.length === 1 ? "1 response" : `${topResponses.length} responses`
      })
    )
  );

  if (topResponses.length === 0) {
    block.appendChild(el("p", { className: "empty-state", text: `No ${stream.label.toLowerCase()} responses yet.` }));
    return block;
  }

  topResponses.slice(0, 3).forEach((response) => {
    block.appendChild(buildTopResponseItem(response, post));
  });
  return block;
}

function buildTopLevelResponseForm(post) {
  const draft = getResponseDraft(post.id);
  const select = el("select", { name: "responseType" },
    ...RESPONSE_STREAMS.map((stream) => el("option", { value: stream.key, text: stream.label }))
  );
  select.value = draft.responseType || DEFAULT_RESPONSE_TYPE;
  return el("form", { className: "comment-form", dataset: { postId: post.id } },
    el("label", {}, el("span", { text: "Response stream" }), select),
    el("label", {},
      el("span", { text: `Your response (${RESPONSE_WORD_LIMIT} words max)` }),
      el("textarea", {
        name: "comment",
        rows: 4,
        placeholder: "Write a reflective, constructive response",
        value: draft.content || ""
      })
    ),
    el("div", { className: "actions-row response-form-actions" },
      el("button", { type: "submit", text: "Submit response" }),
      el("button", { type: "button", className: "secondary", text: "Save draft", dataset: { action: "save-response-draft" } }),
      el("button", { type: "button", className: "secondary", text: "Clear draft", dataset: { action: "clear-response-draft" } })
    ),
    el("p", { className: "message", attrs: { "aria-live": "polite" } })
  );
}

function buildFeedPostCard(post) {
  const responses = getAllResponsesForPost(post.id);
  const subMusings = getApprovedSubMusings(post.id);
  const card = el("article", { className: "reddit-feed-card feed-card" });
  card.appendChild(
    el("div", { className: "reddit-feed-vote" },
      el("strong", { className: "reddit-feed-score", text: String(getPostDepth(post.id)) }),
      el("span", { className: "reddit-feed-score-label", text: "Depth" })
    )
  );

  const body = el("div", { className: "reddit-feed-body" },
    el("p", {
      className: "reddit-listing-meta",
      text: `Anonymous post | ${formatRelativeDate(post.approvedAt || post.createdAt)} | Community board`
    }),
    el("h3", { text: post.title }),
    el("p", { text: post.content }),
    el("div", {
      className: "meta-row",
      text: `${post.format || "Reflection"} | ${(post.category || "General")} | ${String(post.sensitivity || "medium").toUpperCase()} sensitivity`
    })
  );

  const mediaPreview = buildMediaPreview(post);
  if (mediaPreview) {
    body.appendChild(mediaPreview);
  }
  if (post.whyMatters) {
    body.appendChild(el("p", { className: "lead compact", text: `Why this matters: ${post.whyMatters}` }));
  }
  if (post.hopedConversation) {
    body.appendChild(el("p", { className: "lead compact", text: `Conversation prompt: ${post.hopedConversation}` }));
  }

  body.appendChild(
    el("div", { className: "reddit-listing-actions" },
      el("span", { text: responses.length === 1 ? "1 response" : `${responses.length} responses` }),
      subMusings.length > 0
        ? el("button", {
          type: "button",
          className: "sub-musing-link-button",
          text: subMusings.length === 1 ? "Open 1 sub-musing" : `Open ${subMusings.length} sub-musings`,
          dataset: { action: "open-sub-musings", postId: post.id }
        })
        : null,
      appState.session?.role === "user"
        ? el("button", {
          type: "button",
          className: "secondary bookmark-button",
          text: isBookmarked(post.id) ? "Saved" : "Save",
          dataset: { action: "toggle-bookmark", postId: post.id }
        })
        : null,
      el("span", { text: "Council reviewed" }),
      el("span", { text: "Open for response" })
    )
  );

  const streamGrid = el("div", { className: "response-stream-grid" },
    ...RESPONSE_STREAMS.map((stream) => buildResponseStream(stream, post))
  );
  body.appendChild(streamGrid);
  body.appendChild(appState.session?.role === "user" ? buildTopLevelResponseForm(post) : buildGuestPrompt());
  card.appendChild(body);
  return card;
}

function buildMusingThread(post, options = {}) {
  const subMusings = options.nested ? [] : getApprovedSubMusings(post.id);
  const topLevelResponses = getTopLevelResponsesForPost(post.id);
  const thread = el("details", {
    className: `muse-thread-card${options.nested ? " is-nested" : ""}`,
    dataset: { postId: post.id },
    open: Boolean(options.open)
  });

  const summaryMeta = el("div", { className: "muse-summary-meta" },
    el("span", { className: "muse-summary-chip", text: post.category || "General" }),
    el("span", { className: "muse-summary-chip", text: topLevelResponses.length === 1 ? "1 discussion" : `${topLevelResponses.length} discussions` }),
    el("span", {
      className: "muse-summary-chip",
      text: options.nested
        ? formatRelativeDate(post.approvedAt || post.createdAt)
        : subMusings.length === 1 ? "1 sub-musing" : `${subMusings.length} sub-musings`
    })
  );

  thread.appendChild(
    el("summary", { className: "muse-thread-summary" },
      el("div", { className: "muse-summary-copy" },
        el("p", {
          className: "muse-summary-eyebrow",
          text: options.nested ? "Follow-up sub-musing" : formatWeekLabel(post.approvedAt || post.createdAt)
        }),
        el("strong", { className: "muse-summary-title", text: post.title }),
        el("p", { className: "muse-summary-excerpt", text: getSummaryExcerpt(post) }),
        summaryMeta
      ),
      el("span", { className: "muse-summary-toggle", text: options.nested ? "Read follow-up" : "Read muse" })
    )
  );

  const body = el("div", { className: "muse-thread-body" }, buildFeedPostCard(post));
  if (subMusings.length > 0) {
    const subSection = el("section", { className: "sub-musing-section" },
      el("h3", { text: "Sub-musings" }),
      el("p", { className: "lead compact", text: "Open each follow-up to read the approved sub-musing and its own discussions." })
    );
    const subList = el("div", { className: "stack-list nested-muse-list" });
    subMusings.forEach((subMusing) => {
      subList.appendChild(buildMusingThread(subMusing, { nested: true }));
    });
    subSection.appendChild(subList);
    body.appendChild(subSection);
  }
  thread.appendChild(body);
  return thread;
}

function buildNotificationCard(post) {
  const title = post.status === "rejected" ? `Post rejected: ${post.title}` : `Revision requested: ${post.title}`;
  const bodyText = post.status === "rejected"
    ? "The council rejected this submission. You can revise it and resubmit if you want to keep working on the idea."
    : "The council requested revision. Update the framing below and resubmit from the submission form.";
  return el("article", { className: "notification-card" },
    el("h3", { text: title }),
    el("p", { text: bodyText }),
    post.reviewNote ? el("p", { className: "field-hint notification-note", text: `Council note: ${post.reviewNote}` }) : null,
    el("div", { className: "meta-row", text: post.status === "rejected" ? `Rejected ${formatDate(post.rejectedAt)}` : `Revision requested ${formatDate(post.revisionRequestedAt)}` }),
    el("div", { className: "actions-row compact-actions" },
      el("button", {
        type: "button",
        className: "secondary",
        text: "Edit & resubmit",
        dataset: { action: "edit-post", postId: post.id }
      }),
      el("button", {
        type: "button",
        className: "secondary notification-close",
        text: "X",
        dataset: { action: "dismiss-notification", postId: post.id }
      })
    )
  );
}

function buildSubmissionCard(post) {
  const card = el("article", { className: "feed-card" },
    el("h3", { text: post.title }),
    el("p", { text: post.content }),
    el("div", { className: "meta-row", text: `${post.format || "Reflection"} | ${post.category || "General"} | ${String(post.status || "pending").replaceAll("_", " ")}` }),
    el("div", { className: "meta-row", text: `Last updated ${formatDate(post.updatedAt || post.createdAt)}` })
  );
  if (post.reviewNote) {
    card.appendChild(el("p", { className: "lead compact", text: `Council note: ${post.reviewNote}` }));
  }
  const mediaPreview = buildMediaPreview(post);
  if (mediaPreview) {
    card.appendChild(mediaPreview);
  }
  card.appendChild(
    el("div", { className: "actions-row compact-actions" },
      el("button", {
        type: "button",
        className: "secondary",
        text: "Edit",
        dataset: { action: "edit-post", postId: post.id }
      })
    )
  );
  return card;
}

function buildModerationCard(post) {
  const card = el("article", { className: "feed-card", dataset: { postId: post.id } },
    el("h3", { text: post.title }),
    el("p", { text: post.content }),
    el("div", { className: "meta-row", text: `Submitted by ${post.userEmail} | ${post.format || "Reflection"} | ${post.category || "General"} | ${String(post.sensitivity || "medium").toUpperCase()} sensitivity` }),
    el("p", { className: "lead compact", text: `Why this matters: ${post.whyMatters || "No context provided."}` }),
    el("p", { className: "lead compact", text: `Conversation prompt: ${post.hopedConversation || "No prompt provided."}` })
  );
  const mediaPreview = buildMediaPreview(post);
  if (mediaPreview) {
    card.appendChild(mediaPreview);
  }
  card.appendChild(
    el("label", {},
      el("span", { text: "Moderation note" }),
      el("textarea", {
        className: "moderation-note-field",
        rows: 4,
        placeholder: "Leave guidance for the submitter. Required for revision or rejection.",
        value: post.reviewNote || ""
      })
    )
  );
  card.appendChild(
    el("div", { className: "actions-row" },
      el("button", { type: "button", text: "Approve", dataset: { action: "approve", postId: post.id } }),
      el("button", { type: "button", className: "secondary", text: "Request Revision", dataset: { action: "revise", postId: post.id } }),
      el("button", { type: "button", className: "secondary", text: "Reject", dataset: { action: "reject", postId: post.id } })
    )
  );
  return card;
}

function buildFlaggedResponseCard(response) {
  const card = el("article", { className: "feed-card", dataset: { commentId: response.id } },
    el("h3", { text: `${getResponseLabel(response.responseType)} response` }),
    el("p", { text: response.content }),
    el("div", { className: "meta-row", text: `Post #${response.postId} | ${response.flagCount} open reports` })
  );
  const reportList = el("div", { className: "report-list" });
  response.reports.forEach((report) => {
    reportList.appendChild(
      el("article", { className: "report-item" },
        el("p", { className: "report-meta", text: `${getReportReasonLabel(report.reason)} | ${getReportUrgencyLabel(report.urgency)} | ${formatDate(report.createdAt)}` }),
        el("p", { text: report.details })
      )
    );
  });
  card.appendChild(reportList);
  card.appendChild(
    el("label", {},
      el("span", { text: "Resolution note" }),
      el("textarea", {
        className: "moderation-note-field",
        rows: 3,
        placeholder: "Optional note about how this report was resolved."
      })
    )
  );
  card.appendChild(
    el("div", { className: "actions-row" },
      el("button", { type: "button", text: "Keep response", dataset: { action: "flag-keep", commentId: response.id } }),
      el("button", { type: "button", className: "secondary", text: "Remove response", dataset: { action: "flag-remove", commentId: response.id } })
    )
  );
  return card;
}

function configureUserPageAccess() {
  if (!isUserAreaPage()) {
    return;
  }
  const isMember = appState.session?.role === "user";
  const taskbar = document.getElementById("bottom-taskbar");
  const logoutButton = document.getElementById("logout-button");
  const loginNavButton = document.getElementById("login-nav-button");
  const submitSection = document.getElementById("submit-section");
  const notificationSection = document.getElementById("notifications-section");
  const suggestionsSection = document.getElementById("my-suggestions-section");
  const accountSection = document.getElementById("account-settings-section");
  const memberLead = document.getElementById("member-lead");
  const feedLead = document.getElementById("feed-lead");
  const headerProfile = document.getElementById("header-profile");
  const headerProfileName = document.getElementById("header-profile-name");
  const headerProfileEmail = document.getElementById("header-profile-email");
  const headerProfileAvatar = document.getElementById("header-profile-avatar");

  document.body.classList.toggle("has-bottom-taskbar", Boolean(taskbar && isMember));
  if (taskbar) {
    taskbar.hidden = !isMember;
  }
  if (logoutButton) {
    logoutButton.hidden = !isMember;
  }
  if (loginNavButton) {
    loginNavButton.hidden = isMember;
    loginNavButton.style.display = isMember ? "none" : "";
  }
  if (headerProfile) {
    headerProfile.hidden = !isMember;
  }
  if (headerProfileName) {
    headerProfileName.textContent = isMember ? getSessionDisplayName() : "Guest";
  }
  if (headerProfileEmail) {
    headerProfileEmail.textContent = isMember ? (appState.session?.email || "") : "Not logged in";
  }
  if (headerProfileAvatar) {
    populateAvatar(headerProfileAvatar, {
      name: getSessionDisplayName(),
      avatarDataUrl: appState.session?.avatarDataUrl || "",
      shellClassName: "header-avatar"
    });
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
  if (accountSection) {
    accountSection.hidden = !isMember;
  }
  if (memberLead) {
    memberLead.textContent = isMember
      ? "Your account can submit musings, receive council notes, and resubmit revisions from this page."
      : "You are viewing as a guest. Login to submit musings, save posts, and track council updates.";
  }
  if (feedLead) {
    feedLead.textContent = isMember
      ? "Browse the full council-reviewed archive below. Save musings, respond anonymously, and surface a follow-up sub-musing."
      : "Browse the full council-reviewed archive below. Login to respond, save musings, or surface a follow-up sub-musing.";
  }
}

function renderUserFeed() {
  const feed = document.getElementById("approved-feed");
  const feedEmpty = document.getElementById("feed-empty-state");
  const summary = document.getElementById("feed-results-summary");
  const categorySelect = document.getElementById("feed-category");
  const searchInput = document.getElementById("feed-search");
  const sortSelect = document.getElementById("feed-sort");
  const bookmarksOnly = document.getElementById("feed-bookmarks-only");

  if (!(feed instanceof HTMLElement)) {
    return;
  }

  const categories = getFeedCategories();
  if (categorySelect instanceof HTMLSelectElement) {
    clearElement(categorySelect);
    categorySelect.appendChild(el("option", { value: "all", text: "All categories" }));
    categories.forEach((category) => {
      categorySelect.appendChild(el("option", { value: category, text: category }));
    });
    categorySelect.value = uiState.feed.category;
  }
  if (searchInput instanceof HTMLInputElement) {
    searchInput.value = uiState.feed.search;
  }
  if (sortSelect instanceof HTMLSelectElement) {
    sortSelect.value = uiState.feed.sort || "recent";
  }
  if (bookmarksOnly instanceof HTMLInputElement) {
    bookmarksOnly.checked = uiState.feed.bookmarksOnly;
  }

  const posts = getVisibleFeedPosts();
  clearElement(feed);
  posts.forEach((post, index) => {
    feed.appendChild(buildMusingThread(post, { open: index === 0 }));
  });
  if (summary) {
    summary.textContent = posts.length === 1
      ? "Showing 1 approved muse."
      : `Showing ${posts.length} approved muses.`;
  }
  if (feedEmpty) {
    feedEmpty.hidden = posts.length > 0;
  }
}

function renderSuggestionPage() {
  const notificationList = document.getElementById("notification-list");
  const notificationEmpty = document.getElementById("notification-empty-state");
  const userPostList = document.getElementById("user-post-list");
  const userEmpty = document.getElementById("user-empty-state");

  const mine = appState.session?.role === "user"
    ? appState.posts.filter((post) => post.userEmail === appState.session.email && ["pending", "revision_requested", "rejected"].includes(post.status))
    : [];
  const notifications = appState.session?.role === "user"
    ? mine.filter((post) => ["revision_requested", "rejected"].includes(post.status) && !appState.dismissedNotifications.includes(post.id))
    : [];

  if (notificationList) {
    clearElement(notificationList);
    notifications.forEach((post) => notificationList.appendChild(buildNotificationCard(post)));
  }
  if (notificationEmpty) {
    notificationEmpty.hidden = notifications.length > 0;
  }
  if (userPostList) {
    clearElement(userPostList);
    mine.forEach((post) => userPostList.appendChild(buildSubmissionCard(post)));
  }
  if (userEmpty) {
    userEmpty.hidden = mine.length > 0;
  }
  syncSuggestionForm();
}

function renderAdminPage() {
  const pendingPosts = appState.posts.filter((post) => post.status === "pending" && !post.parentPostId);
  const pendingSubMusings = appState.posts.filter((post) => post.status === "pending" && post.parentPostId);
  const flaggedResponses = appState.comments
    .filter((comment) => comment.status !== "removed" && comment.flagCount > 0)
    .sort((first, second) => second.flagCount - first.flagCount);

  const adminPostList = document.getElementById("admin-post-list");
  const submuseList = document.getElementById("submuse-request-list");
  const flaggedList = document.getElementById("flagged-response-list");
  const pendingCount = document.getElementById("pending-count");
  const submuseCount = document.getElementById("submuse-count");
  const flaggedCount = document.getElementById("flagged-count");
  const adminEmpty = document.getElementById("admin-empty-state");
  const submuseEmpty = document.getElementById("submuse-empty-state");
  const flaggedEmpty = document.getElementById("flagged-empty-state");

  if (pendingCount) pendingCount.textContent = `${pendingPosts.length} waiting for review`;
  if (submuseCount) submuseCount.textContent = `${pendingSubMusings.length} awaiting review`;
  if (flaggedCount) flaggedCount.textContent = `${flaggedResponses.length} reported responses`;
  if (adminPostList) {
    clearElement(adminPostList);
    pendingPosts.forEach((post) => adminPostList.appendChild(buildModerationCard(post)));
  }
  if (submuseList) {
    clearElement(submuseList);
    pendingSubMusings.forEach((post) => submuseList.appendChild(buildModerationCard(post)));
  }
  if (flaggedList) {
    clearElement(flaggedList);
    flaggedResponses.forEach((response) => flaggedList.appendChild(buildFlaggedResponseCard(response)));
  }
  if (adminEmpty) adminEmpty.hidden = pendingPosts.length > 0;
  if (submuseEmpty) submuseEmpty.hidden = pendingSubMusings.length > 0;
  if (flaggedEmpty) flaggedEmpty.hidden = flaggedResponses.length > 0;
}

function syncSuggestionForm() {
  const form = document.getElementById("post-form");
  if (!(form instanceof HTMLFormElement)) {
    return;
  }
  const hiddenId = form.querySelector('input[name="postId"]');
  const cancelButton = document.getElementById("post-cancel-edit");
  const submitButton = document.getElementById("post-submit-button");
  const editPost = uiState.editingPostId
    ? appState.posts.find((post) => Number(post.id) === Number(uiState.editingPostId))
    : null;

  if (!(hiddenId instanceof HTMLInputElement) || !(submitButton instanceof HTMLButtonElement)) {
    return;
  }

  if (!editPost) {
    hiddenId.value = "";
    submitButton.textContent = "Submit for approval";
    if (cancelButton) cancelButton.hidden = true;
    clearMediaPreview();
    return;
  }

  hiddenId.value = String(editPost.id);
  submitButton.textContent = "Resubmit for approval";
  if (cancelButton) cancelButton.hidden = false;
  form.elements.title.value = editPost.title || "";
  form.elements.content.value = editPost.content || "";
  form.elements.mediaType.value = inferMediaTypeFromPost(editPost) || "video";
  form.elements.whyMatters.value = editPost.whyMatters || "";
  form.elements.hopedConversation.value = editPost.hopedConversation || "";
  form.elements.category.value = editPost.category || "";
  form.elements.sensitivity.value = editPost.sensitivity || "medium";
  form.elements.declaration.checked = Boolean(editPost.declarationAccepted);
  showExistingMediaPreview(editPost);
}

function renderSettingsPage() {
  const accountRole = document.getElementById("account-role");
  const accountEmail = document.getElementById("account-email");
  const accountAvatarSummary = document.getElementById("account-avatar-summary");
  if (accountRole) {
    accountRole.textContent = appState.session?.role === "user" ? "User" : "Guest";
  }
  if (accountEmail) {
    accountEmail.textContent = appState.session?.role === "user"
      ? `${getSessionDisplayName()} · ${appState.session?.email || ""}`
      : "Login to manage server-backed settings.";
  }
  if (accountAvatarSummary instanceof HTMLElement) {
    clearElement(accountAvatarSummary);
    if (appState.session?.role === "user") {
      const shell = el("div");
      populateAvatar(shell, {
        name: getSessionDisplayName(),
        avatarDataUrl: appState.session?.avatarDataUrl || "",
        shellClassName: "profile-avatar-shell"
      });
      accountAvatarSummary.appendChild(
        el("div", { className: "profile-avatar-card" },
          shell,
          el("div", { className: "profile-avatar-meta" },
            el("strong", { text: getSessionDisplayName() }),
            el("span", { text: "Current profile picture and display name" })
          )
        )
      );
    }
  }
  syncThemeSettingsUi();
  syncAccountSettingsUi();
}

function renderCurrentPage() {
  configureUserPageAccess();
  const page = getPage();
  if (page === "user") {
    renderUserFeed();
  }
  if (page === "user-suggestion") {
    renderSuggestionPage();
  }
  if (page === "user-settings") {
    renderSettingsPage();
  }
  if (page === "admin") {
    renderAdminPage();
  }
}

function guardPage() {
  const page = getPage();
  if (page === "admin" && appState.session?.role !== "admin") {
    window.location.href = appState.session?.redirect || "index.html";
    return;
  }
  if (["user-settings", "user-suggestion"].includes(page) && appState.session?.role === "admin") {
    window.location.href = "admin.html";
  }
}

function showMessage(id, text) {
  const node = document.getElementById(id);
  if (node) {
    node.textContent = text;
  }
}

function openGuestLoginModal() {
  const modal = document.getElementById("guest-login-modal");
  if (!modal) {
    return;
  }
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  showMessage("guest-login-message", "");
  const form = document.getElementById("guest-login-form");
  if (form instanceof HTMLFormElement) {
    form.reset();
  }
}

function closeGuestLoginModal() {
  const modal = document.getElementById("guest-login-modal");
  if (!modal) {
    return;
  }
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function syncThemeSettingsUi() {
  const form = document.getElementById("theme-settings-form");
  const activeThemeName = document.getElementById("active-theme-name");
  const activeThemeDescription = document.getElementById("active-theme-description");
  if (!(form instanceof HTMLFormElement)) {
    return;
  }
  const themeKey = appState.session?.role === "user"
    ? appState.settings.theme || DEFAULT_THEME
    : getStoredTheme();
  const theme = getThemeOption(themeKey);
  const radio = form.querySelector(`input[name="themePreference"][value="${theme.key}"]`);
  if (radio instanceof HTMLInputElement) {
    radio.checked = true;
  }
  if (activeThemeName) {
    activeThemeName.textContent = theme.label;
  }
  if (activeThemeDescription) {
    activeThemeDescription.textContent = theme.description;
  }
}

function renderProfilePicturePreview() {
  const preview = document.getElementById("profile-picture-preview");
  const accountForm = document.getElementById("account-settings-form");
  if (!(preview instanceof HTMLElement)) {
    return;
  }
  clearElement(preview);
  const isMember = appState.session?.role === "user";
  if (!isMember) {
    preview.hidden = true;
    return;
  }
  const avatarDataUrl = uiState.profileAvatarDraft !== undefined
    ? uiState.profileAvatarDraft
    : (appState.session?.avatarDataUrl || "");
  const draftDisplayName = accountForm instanceof HTMLFormElement && accountForm.elements.displayName instanceof HTMLInputElement
    ? String(accountForm.elements.displayName.value || "").trim()
    : "";
  const previewName = draftDisplayName || getSessionDisplayName();
  const shell = el("div");
  populateAvatar(shell, {
    name: previewName,
    avatarDataUrl,
    shellClassName: "profile-avatar-shell"
  });
  preview.appendChild(
    el("div", { className: "profile-avatar-card" },
      shell,
      el("div", { className: "profile-avatar-meta" },
        el("strong", { text: avatarDataUrl ? "Profile picture ready" : "Using initials avatar" }),
        el("span", {
          text: avatarDataUrl
            ? "This preview will be saved when you submit account settings."
            : "Upload an image if you want a custom profile picture."
        })
      )
    )
  );
  preview.hidden = false;
}

function syncAccountSettingsUi() {
  const form = document.getElementById("account-settings-form");
  if (!(form instanceof HTMLFormElement)) {
    return;
  }
  const isMember = appState.session?.role === "user";
  form.hidden = !isMember;
  const passwordForm = document.getElementById("password-settings-form");
  if (passwordForm instanceof HTMLFormElement) {
    passwordForm.hidden = !isMember;
  }
  if (!isMember) {
    renderProfilePicturePreview();
    return;
  }
  if (form.elements.displayName instanceof HTMLInputElement) {
    form.elements.displayName.value = getSessionDisplayName();
  }
  form.elements.reviewUpdatesEnabled.checked = Boolean(appState.settings.reviewUpdatesEnabled);
  form.elements.weeklyDigestEnabled.checked = Boolean(appState.settings.weeklyDigestEnabled);
  form.elements.defaultFeedSort.value = appState.settings.defaultFeedSort || "recent";
  form.elements.hideHighSensitivity.checked = Boolean(appState.settings.hideHighSensitivity);
  renderProfilePicturePreview();
}

function clearMediaPreview() {
  const preview = document.getElementById("media-upload-preview");
  if (uiState.mediaPreviewUrl) {
    URL.revokeObjectURL(uiState.mediaPreviewUrl);
    uiState.mediaPreviewUrl = "";
  }
  if (preview) {
    preview.hidden = true;
    preview.innerHTML = "";
  }
}

function showExistingMediaPreview(post) {
  const preview = document.getElementById("media-upload-preview");
  if (!(preview instanceof HTMLElement)) {
    return;
  }
  clearMediaPreview();
  const mediaPreview = buildMediaPreview(post);
  if (!mediaPreview) {
    return;
  }
  preview.appendChild(mediaPreview);
  preview.hidden = false;
}

function showSelectedFilePreview(file) {
  const preview = document.getElementById("media-upload-preview");
  if (!(preview instanceof HTMLElement)) {
    return;
  }
  clearMediaPreview();
  if (!(file instanceof File) || file.size <= 0) {
    return;
  }
  const previewType = inferMediaTypeFromMime(file.type) || inferMediaTypeFromFilename(file.name);
  if (!previewType) {
    return;
  }
  uiState.mediaPreviewUrl = URL.createObjectURL(file);
  const previewPost = {
    title: file.name,
    mediaType: previewType,
    mediaName: file.name,
    mediaDataUrl: uiState.mediaPreviewUrl
  };
  preview.appendChild(buildMediaPreview(previewPost));
  preview.hidden = false;
}

function getModerationNoteFromAction(source) {
  const card = source.closest(".feed-card");
  const field = card?.querySelector(".moderation-note-field");
  return field instanceof HTMLTextAreaElement ? field.value.trim() : "";
}

function bindAuthForms() {
  const loginForm = document.getElementById("login-form");
  if (loginForm instanceof HTMLFormElement && !loginForm.dataset.bound) {
    loginForm.dataset.bound = "true";
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(loginForm);
      try {
        const payload = await apiRequest("/api/login", {
          method: "POST",
          body: {
            email: formData.get("email"),
            password: formData.get("password")
          }
        });
        hydrateState(payload);
        window.location.href = payload.session.redirect;
      } catch (error) {
        showMessage("login-message", error.message);
      }
    });
  }

  const signupForm = document.getElementById("signup-form");
  if (signupForm instanceof HTMLFormElement && !signupForm.dataset.bound) {
    signupForm.dataset.bound = "true";
    signupForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(signupForm);
      try {
        const payload = await apiRequest("/api/signup", {
          method: "POST",
          body: {
            email: formData.get("email"),
            password: formData.get("password"),
            confirmPassword: formData.get("confirmPassword")
          }
        });
        hydrateState(payload);
        window.location.href = payload.session.redirect;
      } catch (error) {
        showMessage("signup-message", error.message);
      }
    });
  }

  const guestLoginForm = document.getElementById("guest-login-form");
  if (guestLoginForm instanceof HTMLFormElement && !guestLoginForm.dataset.bound) {
    guestLoginForm.dataset.bound = "true";
    guestLoginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(guestLoginForm);
      try {
        await refreshFromApi("/api/login", {
          method: "POST",
          body: {
            email: formData.get("email"),
            password: formData.get("password")
          }
        });
        closeGuestLoginModal();
      } catch (error) {
        showMessage("guest-login-message", error.message);
      }
    });
  }

  const logoutButton = document.getElementById("logout-button");
  if (logoutButton instanceof HTMLButtonElement && !logoutButton.dataset.bound) {
    logoutButton.dataset.bound = "true";
    logoutButton.addEventListener("click", async () => {
      try {
        await refreshFromApi("/api/logout", { method: "POST" });
        if (getPage() !== "login") {
          window.location.href = "index.html";
        }
      } catch (error) {
        if (getPage() === "login") {
          showMessage("login-message", error.message);
        }
      }
    });
  }

  const guestModal = document.getElementById("guest-login-modal");
  if (guestModal && !guestModal.dataset.bound) {
    guestModal.dataset.bound = "true";
    guestModal.addEventListener("click", (event) => {
      if (event.target === guestModal) {
        closeGuestLoginModal();
      }
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("[data-action='close-login-modal']")) {
        closeGuestLoginModal();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeGuestLoginModal();
      }
    });
  }
}

function bindFeedControls() {
  const controls = document.getElementById("feed-controls");
  if (!(controls instanceof HTMLFormElement) || controls.dataset.bound) {
    return;
  }
  controls.dataset.bound = "true";
  controls.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    if (target.id === "feed-search") {
      uiState.feed.search = target.value;
    }
    renderUserFeed();
  });
  controls.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    if (target.id === "feed-category") {
      uiState.feed.category = target.value;
    }
    if (target.id === "feed-sort") {
      uiState.feed.sort = target.value;
    }
    if (target.id === "feed-bookmarks-only") {
      uiState.feed.bookmarksOnly = Boolean(target.checked);
    }
    renderUserFeed();
  });
}

function bindFeedInteractions() {
  const feed = document.getElementById("approved-feed");
  if (!(feed instanceof HTMLElement) || feed.dataset.bound) {
    return;
  }
  feed.dataset.bound = "true";

  feed.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const actionSource = target.closest("[data-action]");
    if (!(actionSource instanceof HTMLElement)) {
      return;
    }
    const action = String(actionSource.dataset.action || "");
    const postId = Number(actionSource.dataset.postId || actionSource.closest("[data-post-id]")?.dataset.postId);
    const commentId = Number(actionSource.dataset.commentId || actionSource.closest("[data-comment-id]")?.dataset.commentId);

    if (action === "open-login-modal") {
      openGuestLoginModal();
      return;
    }
    if (action === "open-sub-musings") {
      const thread = feed.querySelector(`.muse-thread-card[data-post-id="${postId}"]`);
      if (thread instanceof HTMLDetailsElement) {
        thread.open = true;
        const subSection = thread.querySelector(".sub-musing-section");
        if (subSection instanceof HTMLElement) {
          subSection.querySelectorAll(".muse-thread-card").forEach((node) => {
            if (node instanceof HTMLDetailsElement) {
              node.open = true;
            }
          });
          subSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
      return;
    }
    if (action === "toggle-reply-form" || action === "toggle-report-form") {
      const selector = action === "toggle-reply-form" ? ".reply-form" : ".report-form";
      const form = actionSource.closest(".comment-item")?.querySelector(selector);
      if (form instanceof HTMLFormElement) {
        form.hidden = !form.hidden;
      }
      return;
    }
    if (action === "save-response-draft" || action === "clear-response-draft") {
      const form = actionSource.closest("form.comment-form");
      if (!(form instanceof HTMLFormElement)) {
        return;
      }
      const message = form.querySelector(".message");
      try {
        if (action === "clear-response-draft") {
          await refreshFromApi("/api/user/drafts", {
            method: "POST",
            body: { action: "clear", postId: Number(form.dataset.postId) }
          });
          form.reset();
          form.querySelector('select[name="responseType"]').value = DEFAULT_RESPONSE_TYPE;
          if (message) message.textContent = "Draft cleared.";
        } else {
          await refreshFromApi("/api/user/drafts", {
            method: "POST",
            body: {
              action: "save",
              postId: Number(form.dataset.postId),
              responseType: form.querySelector('select[name="responseType"]').value,
              content: form.querySelector('textarea[name="comment"]').value
            }
          });
          if (message) message.textContent = "Draft saved.";
        }
      } catch (error) {
        if (message) message.textContent = error.message;
      }
      return;
    }
    if (action === "toggle-bookmark") {
      try {
        await refreshFromApi("/api/user/bookmarks/toggle", {
          method: "POST",
          body: { postId }
        });
      } catch (error) {}
      return;
    }
    if (["like-response", "signal-resonate", "signal-discuss"].includes(action)) {
      try {
        await refreshFromApi(`/api/comments/${commentId}/signal`, {
          method: "POST",
          body: { action }
        });
      } catch (error) {}
      return;
    }
    if (action === "request-sub-musing") {
      try {
        await refreshFromApi(`/api/comments/${commentId}/sub-musing`, { method: "POST" });
      } catch (error) {}
    }
  });

  feed.addEventListener("submit", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLFormElement)) {
      return;
    }
    event.preventDefault();
    const message = target.querySelector(".message");

    if (target.classList.contains("comment-form")) {
      try {
        await refreshFromApi("/api/comments", {
          method: "POST",
          body: {
            postId: Number(target.dataset.postId),
            responseType: target.querySelector('select[name="responseType"]').value,
            content: target.querySelector('textarea[name="comment"]').value
          }
        });
      } catch (error) {
        if (message) message.textContent = error.message;
      }
      return;
    }

    if (target.classList.contains("reply-form")) {
      try {
        await refreshFromApi("/api/comments", {
          method: "POST",
          body: {
            postId: Number(target.dataset.postId),
            parentResponseId: Number(target.dataset.parentResponseId),
            content: target.querySelector('textarea[name="comment"]').value
          }
        });
      } catch (error) {
        if (message) message.textContent = error.message;
      }
      return;
    }

    if (target.classList.contains("report-form")) {
      try {
        await refreshFromApi(`/api/comments/${Number(target.dataset.commentId)}/report`, {
          method: "POST",
          body: {
            reason: target.querySelector('select[name="reason"]').value,
            urgency: target.querySelector('select[name="urgency"]').value,
            details: target.querySelector('textarea[name="details"]').value
          }
        });
      } catch (error) {
        if (message) message.textContent = error.message;
      }
    }
  });
}

function bindSuggestionPage() {
  const postForm = document.getElementById("post-form");
  if (postForm instanceof HTMLFormElement && !postForm.dataset.bound) {
    postForm.dataset.bound = "true";
    const mediaField = postForm.querySelector('input[name="mediaFile"]');
    if (mediaField instanceof HTMLInputElement) {
      mediaField.addEventListener("change", () => {
        const file = mediaField.files && mediaField.files.length > 0 ? mediaField.files[0] : null;
        showSelectedFilePreview(file);
      });
    }
    postForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(postForm);
      const message = document.getElementById("post-message");
      const mediaFile = formData.get("mediaFile");
      let mediaDataUrl = "";
      let mediaMimeType = "";
      let mediaName = "";
      if (mediaFile instanceof File && mediaFile.size > 0) {
        if (mediaFile.size > MEDIA_UPLOAD_LIMIT_BYTES) {
          showMessage("post-message", "Uploaded media must be 4 MB or smaller.");
          return;
        }
        mediaDataUrl = await readFileAsDataUrl(mediaFile);
        mediaMimeType = String(mediaFile.type || "");
        mediaName = String(mediaFile.name || "");
      } else if (uiState.editingPostId) {
        const editingPost = appState.posts.find((post) => Number(post.id) === Number(uiState.editingPostId));
        mediaDataUrl = editingPost?.mediaDataUrl || "";
        mediaMimeType = editingPost?.mediaMimeType || "";
        mediaName = editingPost?.mediaName || "";
      }
      try {
        await refreshFromApi("/api/posts", {
          method: "POST",
          body: {
            id: formData.get("postId") || null,
            title: formData.get("title"),
            content: formData.get("content"),
            mediaType: formData.get("mediaType"),
            mediaMimeType,
            mediaName,
            mediaDataUrl,
            whyMatters: formData.get("whyMatters"),
            hopedConversation: formData.get("hopedConversation"),
            category: formData.get("category"),
            sensitivity: formData.get("sensitivity"),
            declarationAccepted: formData.get("declaration") === "on"
          }
        });
        uiState.editingPostId = null;
        postForm.reset();
        clearMediaPreview();
        if (message) {
          message.textContent = "Musing submitted for council review.";
        }
      } catch (error) {
        if (message) message.textContent = error.message;
      }
    });
  }

  const cancelEdit = document.getElementById("post-cancel-edit");
  if (cancelEdit instanceof HTMLButtonElement && !cancelEdit.dataset.bound) {
    cancelEdit.dataset.bound = "true";
    cancelEdit.addEventListener("click", () => {
      uiState.editingPostId = null;
      const form = document.getElementById("post-form");
      if (form instanceof HTMLFormElement) {
        form.reset();
      }
      clearMediaPreview();
      renderSuggestionPage();
    });
  }

  const notificationList = document.getElementById("notification-list");
  const userPostList = document.getElementById("user-post-list");
  [notificationList, userPostList].forEach((container) => {
    if (!(container instanceof HTMLElement) || container.dataset.bound) {
      return;
    }
    container.dataset.bound = "true";
    container.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      const actionSource = target.closest("[data-action]");
      if (!(actionSource instanceof HTMLElement)) {
        return;
      }
      const action = actionSource.dataset.action;
      const postId = Number(actionSource.dataset.postId);
      if (action === "edit-post") {
        uiState.editingPostId = postId;
        renderSuggestionPage();
        document.getElementById("submit-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (action === "dismiss-notification") {
        try {
          await refreshFromApi("/api/user/notifications/dismiss", {
            method: "POST",
            body: { postId }
          });
        } catch (error) {}
      }
    });
  });
}

function bindSettingsPage() {
  const themeForm = document.getElementById("theme-settings-form");
  if (themeForm instanceof HTMLFormElement && !themeForm.dataset.bound) {
    themeForm.dataset.bound = "true";
    themeForm.addEventListener("change", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || target.name !== "themePreference") {
        return;
      }
      const theme = getThemeOption(target.value).key;
      if (appState.session?.role === "user") {
        try {
          await refreshFromApi("/api/user/settings", {
            method: "POST",
            body: { theme }
          });
          showMessage("theme-settings-message", `${getThemeOption(theme).label} aesthetic applied.`);
        } catch (error) {
          showMessage("theme-settings-message", error.message);
        }
      } else {
        applyThemePreference(theme);
        syncThemeSettingsUi();
        showMessage("theme-settings-message", `${getThemeOption(theme).label} aesthetic applied on this device.`);
      }
    });
    themeForm.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !target.closest("[data-action='reset-theme-preference']")) {
        return;
      }
      event.preventDefault();
      if (appState.session?.role === "user") {
        try {
          await refreshFromApi("/api/user/settings", {
            method: "POST",
            body: { theme: DEFAULT_THEME }
          });
          showMessage("theme-settings-message", `${getThemeOption(DEFAULT_THEME).label} aesthetic restored.`);
        } catch (error) {
          showMessage("theme-settings-message", error.message);
        }
      } else {
        applyThemePreference(DEFAULT_THEME);
        syncThemeSettingsUi();
        showMessage("theme-settings-message", `${getThemeOption(DEFAULT_THEME).label} aesthetic restored.`);
      }
    });
  }

  const accountForm = document.getElementById("account-settings-form");
  if (accountForm instanceof HTMLFormElement && !accountForm.dataset.bound) {
    accountForm.dataset.bound = "true";
    const displayNameField = accountForm.querySelector('input[name="displayName"]');
    const profilePictureField = accountForm.querySelector('input[name="profilePicture"]');
    if (displayNameField instanceof HTMLInputElement) {
      displayNameField.addEventListener("input", () => {
        renderProfilePicturePreview();
      });
    }
    if (profilePictureField instanceof HTMLInputElement) {
      profilePictureField.addEventListener("change", async () => {
        const file = profilePictureField.files && profilePictureField.files.length > 0
          ? profilePictureField.files[0]
          : null;
        if (!file) {
          uiState.profileAvatarDraft = undefined;
          renderProfilePicturePreview();
          return;
        }
        if (!String(file.type || "").startsWith("image/")) {
          showMessage("account-settings-message", "Profile pictures must be image files.");
          profilePictureField.value = "";
          return;
        }
        if (file.size > (2 * 1024 * 1024)) {
          showMessage("account-settings-message", "Profile pictures must be 2 MB or smaller.");
          profilePictureField.value = "";
          return;
        }
        try {
          uiState.profileAvatarDraft = await readFileAsDataUrl(file);
          renderProfilePicturePreview();
          showMessage("account-settings-message", "Profile picture ready to save.");
        } catch (error) {
          showMessage("account-settings-message", "Could not read that image file.");
        }
      });
    }

    accountForm.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !target.closest("[data-action='remove-profile-picture']")) {
        return;
      }
      event.preventDefault();
      uiState.profileAvatarDraft = "";
      if (profilePictureField instanceof HTMLInputElement) {
        profilePictureField.value = "";
      }
      renderProfilePicturePreview();
      showMessage("account-settings-message", "Profile picture will be removed when you save.");
    });

    accountForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const nextAvatarDataUrl = uiState.profileAvatarDraft !== undefined
          ? uiState.profileAvatarDraft
          : (appState.session?.avatarDataUrl || "");
        await refreshFromApi("/api/user/settings", {
          method: "POST",
          body: {
            displayName: accountForm.elements.displayName.value,
            avatarDataUrl: nextAvatarDataUrl,
            reviewUpdatesEnabled: accountForm.elements.reviewUpdatesEnabled.checked,
            weeklyDigestEnabled: accountForm.elements.weeklyDigestEnabled.checked,
            defaultFeedSort: accountForm.elements.defaultFeedSort.value,
            hideHighSensitivity: accountForm.elements.hideHighSensitivity.checked
          }
        });
        uiState.profileAvatarDraft = undefined;
        if (profilePictureField instanceof HTMLInputElement) {
          profilePictureField.value = "";
        }
        uiState.feed.sort = appState.settings.defaultFeedSort || uiState.feed.sort;
        showMessage("account-settings-message", "Account settings saved.");
      } catch (error) {
        showMessage("account-settings-message", error.message);
      }
    });
  }

  const passwordForm = document.getElementById("password-settings-form");
  if (passwordForm instanceof HTMLFormElement && !passwordForm.dataset.bound) {
    passwordForm.dataset.bound = "true";
    passwordForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await refreshFromApi("/api/user/password", {
          method: "POST",
          body: {
            currentPassword: passwordForm.elements.currentPassword.value,
            nextPassword: passwordForm.elements.nextPassword.value,
            confirmPassword: passwordForm.elements.confirmPassword.value
          }
        });
        passwordForm.reset();
        showMessage("password-settings-message", "Password updated.");
      } catch (error) {
        showMessage("password-settings-message", error.message);
      }
    });
  }
}

function bindAdminPage() {
  ["admin-post-list", "submuse-request-list", "flagged-response-list"].forEach((id) => {
    const container = document.getElementById(id);
    if (!(container instanceof HTMLElement) || container.dataset.bound) {
      return;
    }
    container.dataset.bound = "true";
    container.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      const actionSource = target.closest("[data-action]");
      if (!(actionSource instanceof HTMLElement)) {
        return;
      }
      const action = String(actionSource.dataset.action || "");
      if (["approve", "revise", "reject"].includes(action)) {
        try {
          await refreshFromApi(`/api/admin/posts/${Number(actionSource.dataset.postId)}/moderate`, {
            method: "POST",
            body: { action, note: getModerationNoteFromAction(actionSource) }
          });
        } catch (error) {}
      }
      if (["flag-keep", "flag-remove"].includes(action)) {
        try {
          await refreshFromApi(`/api/admin/comments/${Number(actionSource.dataset.commentId)}/reports`, {
            method: "POST",
            body: { action, note: getModerationNoteFromAction(actionSource) }
          });
        } catch (error) {}
      }
    });
  });
}

function bindPageFeatures() {
  bindAuthForms();
  bindFeedControls();
  bindFeedInteractions();
  bindSuggestionPage();
  bindSettingsPage();
  bindAdminPage();
}

function renderProtocolWarning() {
  document.body.innerHTML = `
    <main class="shell single">
      <section class="panel">
        <p class="eyebrow">Server Required</p>
        <h1>Run the Python server first</h1>
        <p class="lead">This app now uses a real SQLite backend and cookie sessions. Start it with <code>python server.py</code> and open <code>http://127.0.0.1:8000</code> instead of opening the HTML files directly.</p>
      </section>
    </main>
  `;
}

async function initializeApp() {
  if (window.location.protocol === "file:") {
    renderProtocolWarning();
    return;
  }
  try {
    hydrateState(await apiRequest("/api/bootstrap"));
  } catch (error) {
    document.body.innerHTML = `
      <main class="shell single">
        <section class="panel">
          <p class="eyebrow">Connection Error</p>
          <h1>Could not reach the backend</h1>
          <p class="lead">${error.message}</p>
          <p class="field-hint">Start the app with <code>python server.py</code>, then open <code>http://127.0.0.1:8000</code> and refresh. If you are using Live Server or opening the HTML files directly, login will not work.</p>
        </section>
      </main>
    `;
    return;
  }
  guardPage();
  bindPageFeatures();
  renderCurrentPage();
}

document.addEventListener("DOMContentLoaded", initializeApp);
