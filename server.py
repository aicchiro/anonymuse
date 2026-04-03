from __future__ import annotations

import base64
import hashlib
import hmac
import json
import mimetypes
import secrets
import sqlite3
from datetime import datetime, timedelta, timezone
from http import cookies
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "database.db"
SESSION_COOKIE_NAME = "anonymuse_session"
SESSION_DURATION = timedelta(days=14)
PASSWORD_ITERATIONS = 260_000
MEDIA_UPLOAD_LIMIT_BYTES = 4 * 1024 * 1024
RESPONSE_WORD_LIMIT = 300
REPORT_DETAIL_MIN_CHARS = 30
DEFAULT_THEME = "hearth"
DEFAULT_FEED_SORT = "recent"
THEMES = {"hearth", "tideline", "nocturne"}
MEDIA_TYPES = {"video", "audio", "image", "gif"}
RESPONSE_TYPES = {"resonates", "pushes_back", "worth_discussing"}
REPORT_REASONS = {
    "harassment",
    "hate",
    "misinformation",
    "privacy",
    "self_harm",
    "spam",
    "off_topic",
    "other",
}
REPORT_URGENCY = {"high", "medium", "low"}
ALLOWED_STATIC_SUFFIXES = {
    ".css",
    ".gif",
    ".html",
    ".ico",
    ".jpeg",
    ".jpg",
    ".js",
    ".png",
    ".svg",
    ".webp",
}

SEED_USERS = [
    {
        "email": "admin@test.com",
        "password": "Admin123!",
        "role": "admin",
        "display_name": "Admin Council",
    },
    {
        "email": "user@test.com",
        "password": "User123!",
        "role": "user",
        "display_name": "Community Member",
    },
]

SEED_POSTS = [
    {
        "id": 103,
        "seed_key": "weekly-2026-03-31-main",
        "user_email": "user@test.com",
        "title": "What are we protecting when no one names burnout in ministry?",
        "content": "This week's reflection sits with the quiet exhaustion that builds when service becomes performance. If everyone looks dependable in public but depleted in private, a ministry can start rewarding disappearance instead of discipleship.",
        "format": "One-minute audio reflection",
        "why_matters": "Communities often praise availability without noticing the cost. Honest language around burnout makes care, rest, and sustainable leadership more possible.",
        "hoped_conversation": "How do we build a culture where people can name exhaustion before resentment hardens?",
        "category": "Ministry life",
        "sensitivity": "medium",
        "status": "approved",
        "approved_by_email": "admin@test.com",
        "created_at": "2026-03-31T09:00:00.000Z",
        "approved_at": "2026-03-31T09:12:00.000Z",
    },
    {
        "id": 101,
        "seed_key": "weekly-2026-03-17-main",
        "user_email": "user@test.com",
        "title": "When does certainty stop being honest?",
        "content": "This week's reflection asks what happens when confident language leaves no room for repentance, nuance, or lived contradiction. A testimony can sound bold while quietly teaching people that doubt must stay hidden.",
        "format": "One-minute video reflection",
        "why_matters": "Communities need language that keeps conviction and humility together.",
        "hoped_conversation": "How do we speak faithfully without pretending we have no questions?",
        "category": "Theology",
        "sensitivity": "medium",
        "status": "approved",
        "approved_by_email": "admin@test.com",
        "created_at": "2026-03-17T09:00:00.000Z",
        "approved_at": "2026-03-17T09:20:00.000Z",
    },
    {
        "id": 102,
        "seed_key": "weekly-2026-03-10-main",
        "user_email": "user@test.com",
        "title": "Who gets missed when testimony sounds triumphant?",
        "content": "In this week's reflection, we ask who disappears when every testimony has to end in victory. Some people are still in grief, still in treatment, still waiting, and they should not have to translate their pain into a triumph before being believed.",
        "format": "One-minute audio reflection",
        "why_matters": "A healthier church culture can witness suffering without rushing to tidy it up.",
        "hoped_conversation": "What would a testimony sound like if it made room for unresolved grief?",
        "category": "Pastoral care",
        "sensitivity": "high",
        "status": "approved",
        "approved_by_email": "admin@test.com",
        "created_at": "2026-03-10T09:00:00.000Z",
        "approved_at": "2026-03-10T09:18:00.000Z",
    },
    {
        "id": 111,
        "seed_key": "weekly-2026-03-31-sub-rest-before-breakdown",
        "user_email": "user@test.com",
        "parent_post_id": 103,
        "source_comment_id": 201,
        "promoted_by_email": "user@test.com",
        "promoted_at": "2026-03-31T13:00:00.000Z",
        "title": "What does rest sound like before someone breaks down?",
        "content": "This follow-up musing asks how a church can treat early fatigue as something to attend to, not something to spiritualize away. Care usually begins when people are believed before they become a crisis.",
        "format": "One-minute audio reflection",
        "why_matters": "Naming tiredness early can protect both leaders and the people they serve.",
        "hoped_conversation": "What signals tell someone they can speak honestly about limits without being seen as less faithful?",
        "category": "Ministry life",
        "sensitivity": "medium",
        "status": "approved",
        "approved_by_email": "admin@test.com",
        "created_at": "2026-03-31T12:40:00.000Z",
        "approved_at": "2026-04-01T08:45:00.000Z",
    },
    {
        "id": 112,
        "seed_key": "weekly-2026-03-17-sub-gentle-correction",
        "user_email": "user@test.com",
        "parent_post_id": 101,
        "source_comment_id": 204,
        "promoted_by_email": "user@test.com",
        "promoted_at": "2026-03-17T15:20:00.000Z",
        "title": "What does gentle correction sound like in public?",
        "content": "This sub-musing follows the question of certainty into conflict. The issue is not whether correction happens, but whether people leave feeling cornered or accompanied toward truth.",
        "format": "One-minute video reflection",
        "why_matters": "Communities reveal their character in how they handle disagreement.",
        "hoped_conversation": "What makes correction restorative instead of performative?",
        "category": "Leadership",
        "sensitivity": "medium",
        "status": "approved",
        "approved_by_email": "admin@test.com",
        "created_at": "2026-03-17T15:10:00.000Z",
        "approved_at": "2026-03-18T08:30:00.000Z",
    },
    {
        "id": 113,
        "seed_key": "weekly-2026-03-10-sub-grief-space",
        "user_email": "user@test.com",
        "parent_post_id": 102,
        "source_comment_id": 207,
        "promoted_by_email": "user@test.com",
        "promoted_at": "2026-03-10T14:20:00.000Z",
        "title": "How should testimony make space for grief?",
        "content": "This follow-up musing stays with the people still waiting for relief. The invitation is to imagine testimony as witness, not proof that suffering has already been resolved.",
        "format": "One-minute audio reflection",
        "why_matters": "Naming grief honestly helps people belong before they are better.",
        "hoped_conversation": "How can testimony honor God's presence without editing out ongoing pain?",
        "category": "Pastoral care",
        "sensitivity": "high",
        "status": "approved",
        "approved_by_email": "admin@test.com",
        "created_at": "2026-03-10T14:05:00.000Z",
        "approved_at": "2026-03-11T08:10:00.000Z",
    },
]

SEED_PENDING_POST = {
    "id": 2,
    "seed_key": "pending-feature-bookmarks",
    "user_email": "user@test.com",
    "title": "Feature idea",
    "content": "Could we add a bookmarks section for saved content?",
    "format": "One-minute video reflection",
    "why_matters": "People may want to revisit thoughtful reflections.",
    "hoped_conversation": "How can revisit features support deeper reflection over time?",
    "category": "Platform",
    "sensitivity": "low",
    "status": "pending",
    "created_at": "2026-03-24T10:00:00.000Z",
}

SEED_COMMENTS = [
    {
        "id": 201,
        "seed_key": "comment-2026-03-31-main-worth-discussing",
        "post_id": 103,
        "user_email": "user@test.com",
        "response_type": "worth_discussing",
        "content": "A follow-up on what healthy rest looks like in ministry would help. People often need permission before they ask for it.",
        "like_count": 4,
        "resonates_count": 2,
        "discuss_count": 5,
        "created_at": "2026-03-31T11:05:00.000Z",
    },
    {
        "id": 202,
        "seed_key": "comment-2026-03-31-main-pushes-back",
        "post_id": 103,
        "user_email": "user@test.com",
        "response_type": "pushes_back",
        "content": "Some exhaustion is also about boundaries, not only church culture. It would be good to talk about responsibility on both sides.",
        "like_count": 2,
        "resonates_count": 1,
        "discuss_count": 3,
        "created_at": "2026-03-31T11:18:00.000Z",
    },
    {
        "id": 203,
        "seed_key": "comment-2026-03-17-main-resonates",
        "post_id": 101,
        "user_email": "user@test.com",
        "response_type": "resonates",
        "content": "Strong language helps some people hold on, but it should not erase the reality of doubt.",
        "like_count": 3,
        "resonates_count": 4,
        "discuss_count": 2,
        "created_at": "2026-03-17T10:12:00.000Z",
    },
    {
        "id": 204,
        "seed_key": "comment-2026-03-17-main-worth-discussing",
        "post_id": 101,
        "user_email": "user@test.com",
        "response_type": "worth_discussing",
        "content": "A sub-muse on public correction would be helpful because tone changes everything.",
        "like_count": 2,
        "resonates_count": 2,
        "discuss_count": 6,
        "created_at": "2026-03-17T10:28:00.000Z",
    },
    {
        "id": 207,
        "seed_key": "comment-2026-03-10-main-worth-discussing",
        "post_id": 102,
        "user_email": "user@test.com",
        "response_type": "worth_discussing",
        "content": "Can we talk more about how grief belongs in testimony without becoming a lesson?",
        "like_count": 2,
        "resonates_count": 2,
        "discuss_count": 6,
        "created_at": "2026-03-10T10:18:00.000Z",
    },
    {
        "id": 208,
        "seed_key": "comment-2026-03-10-main-pushes-back",
        "post_id": 102,
        "user_email": "user@test.com",
        "response_type": "pushes_back",
        "content": "Victory stories matter too, but they should not be the only stories we platform.",
        "like_count": 1,
        "resonates_count": 1,
        "discuss_count": 3,
        "created_at": "2026-03-10T10:32:00.000Z",
    },
]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def http_cookie_timestamp(value: datetime) -> str:
    return value.astimezone(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S GMT")


def parse_timestamp(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        if value.endswith("Z"):
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        return datetime.fromisoformat(value)
    except ValueError:
        return None


def normalize_email(value: Any) -> str:
    return str(value or "").strip().lower()


def build_default_display_name(email: str) -> str:
    local_part = normalize_email(email).split("@", 1)[0].replace(".", " ").replace("_", " ").replace("-", " ")
    cleaned = " ".join(chunk for chunk in local_part.split() if chunk)
    return cleaned.title() or "Member"


def count_words(value: Any) -> int:
    return len([chunk for chunk in str(value or "").strip().split() if chunk])


def format_for_media_type(media_type: str) -> str:
    labels = {
        "video": "One-minute video reflection",
        "audio": "One-minute audio reflection",
        "image": "Image reflection",
        "gif": "GIF reflection",
    }
    return labels.get(media_type, "One-minute reflection")


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PASSWORD_ITERATIONS)
    return "pbkdf2_sha256${iterations}${salt}${digest}".format(
        iterations=PASSWORD_ITERATIONS,
        salt=base64.b64encode(salt).decode("ascii"),
        digest=base64.b64encode(digest).decode("ascii"),
    )


def verify_password(password: str, stored_value: str) -> bool:
    if stored_value.startswith("pbkdf2_sha256$"):
        try:
            _, iteration_text, salt_text, digest_text = stored_value.split("$", 3)
            iterations = int(iteration_text)
            salt = base64.b64decode(salt_text.encode("ascii"))
            expected = base64.b64decode(digest_text.encode("ascii"))
        except (ValueError, TypeError):
            return False
        candidate = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
        return hmac.compare_digest(candidate, expected)
    return hmac.compare_digest(password, stored_value)


def connect_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def get_columns(conn: sqlite3.Connection, table_name: str) -> set[str]:
    return {row["name"] for row in conn.execute(f"PRAGMA table_info({table_name})")}


def add_column_if_missing(conn: sqlite3.Connection, table_name: str, definition: str) -> None:
    column_name = definition.split()[0]
    if column_name not in get_columns(conn, table_name):
        conn.execute(f"ALTER TABLE {table_name} ADD COLUMN {definition}")


def ensure_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
          display_name TEXT NOT NULL DEFAULT '',
          avatar_data_url TEXT NOT NULL DEFAULT '',
          is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          format TEXT NOT NULL DEFAULT 'One-minute reflection',
          why_matters TEXT,
          hoped_conversation TEXT,
          category TEXT NOT NULL DEFAULT 'General',
          sensitivity TEXT NOT NULL DEFAULT 'medium',
          declaration_accepted INTEGER NOT NULL DEFAULT 1 CHECK(declaration_accepted IN (0, 1)),
          status TEXT NOT NULL DEFAULT 'pending',
          parent_post_id INTEGER,
          source_comment_id INTEGER,
          promoted_by INTEGER,
          promoted_at TEXT,
          approved_by INTEGER,
          rejected_by INTEGER,
          revision_requested_by INTEGER,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          approved_at TEXT,
          rejected_at TEXT,
          revision_requested_at TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (parent_post_id) REFERENCES posts(id),
          FOREIGN KEY (promoted_by) REFERENCES users(id),
          FOREIGN KEY (approved_by) REFERENCES users(id),
          FOREIGN KEY (rejected_by) REFERENCES users(id),
          FOREIGN KEY (revision_requested_by) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          post_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          parent_comment_id INTEGER,
          response_type TEXT NOT NULL DEFAULT 'resonates',
          status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'removed')),
          content TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (post_id) REFERENCES posts(id),
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (parent_comment_id) REFERENCES comments(id)
        );

        CREATE TABLE IF NOT EXISTS comment_interactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          comment_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          interaction_type TEXT NOT NULL CHECK(interaction_type IN ('like', 'resonate', 'discuss', 'flag')),
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (comment_id) REFERENCES comments(id),
          FOREIGN KEY (user_id) REFERENCES users(id),
          CONSTRAINT uq_comment_user_action UNIQUE (comment_id, user_id, interaction_type)
        );

        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id INTEGER NOT NULL,
          created_at TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS comment_reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          comment_id INTEGER NOT NULL,
          reporter_id INTEGER NOT NULL,
          reason TEXT NOT NULL,
          urgency TEXT NOT NULL,
          details TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'kept', 'removed')),
          resolution_note TEXT DEFAULT '',
          resolved_by INTEGER,
          resolved_at TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (comment_id) REFERENCES comments(id),
          FOREIGN KEY (reporter_id) REFERENCES users(id),
          FOREIGN KEY (resolved_by) REFERENCES users(id),
          CONSTRAINT uq_reporter_per_comment UNIQUE (comment_id, reporter_id)
        );

        CREATE TABLE IF NOT EXISTS user_bookmarks (
          user_id INTEGER NOT NULL,
          post_id INTEGER NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (post_id) REFERENCES posts(id),
          CONSTRAINT uq_user_bookmark UNIQUE (user_id, post_id)
        );

        CREATE TABLE IF NOT EXISTS user_settings (
          user_id INTEGER PRIMARY KEY,
          theme TEXT NOT NULL DEFAULT 'hearth',
          review_updates_enabled INTEGER NOT NULL DEFAULT 1 CHECK(review_updates_enabled IN (0, 1)),
          weekly_digest_enabled INTEGER NOT NULL DEFAULT 0 CHECK(weekly_digest_enabled IN (0, 1)),
          default_feed_sort TEXT NOT NULL DEFAULT 'recent',
          hide_high_sensitivity INTEGER NOT NULL DEFAULT 0 CHECK(hide_high_sensitivity IN (0, 1)),
          FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS dismissed_notifications (
          user_id INTEGER NOT NULL,
          post_id INTEGER NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (post_id) REFERENCES posts(id),
          CONSTRAINT uq_user_notification_dismiss UNIQUE (user_id, post_id)
        );

        CREATE TABLE IF NOT EXISTS response_drafts (
          user_id INTEGER NOT NULL,
          post_id INTEGER NOT NULL,
          response_type TEXT NOT NULL,
          content TEXT NOT NULL,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (post_id) REFERENCES posts(id),
          CONSTRAINT uq_user_post_draft UNIQUE (user_id, post_id)
        );
        """
    )

    for definition in [
        "display_name TEXT DEFAULT ''",
        "avatar_data_url TEXT DEFAULT ''",
    ]:
        add_column_if_missing(conn, "users", definition)

    for definition in [
        "seed_key TEXT",
        "media_type TEXT DEFAULT ''",
        "media_mime_type TEXT DEFAULT ''",
        "media_name TEXT DEFAULT ''",
        "media_data_url TEXT DEFAULT ''",
        "review_note TEXT DEFAULT ''",
        "last_submitted_at TEXT",
    ]:
        add_column_if_missing(conn, "posts", definition)

    for definition in [
        "like_count INTEGER NOT NULL DEFAULT 0",
        "resonates_count INTEGER NOT NULL DEFAULT 0",
        "discuss_count INTEGER NOT NULL DEFAULT 0",
        "seed_key TEXT",
    ]:
        add_column_if_missing(conn, "comments", definition)

    conn.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_seed_key
        ON posts(seed_key) WHERE seed_key IS NOT NULL AND seed_key != ''
        """
    )
    conn.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS idx_comments_seed_key
        ON comments(seed_key) WHERE seed_key IS NOT NULL AND seed_key != ''
        """
    )
    conn.execute(
        """
        UPDATE posts
        SET last_submitted_at = COALESCE(last_submitted_at, updated_at, created_at)
        WHERE last_submitted_at IS NULL OR last_submitted_at = ''
        """
    )
    conn.commit()


def ensure_user_settings(conn: sqlite3.Connection, user_id: int) -> None:
    conn.execute(
        """
        INSERT INTO user_settings (
          user_id,
          theme,
          review_updates_enabled,
          weekly_digest_enabled,
          default_feed_sort,
          hide_high_sensitivity
        )
        VALUES (?, ?, 1, 0, ?, 0)
        ON CONFLICT(user_id) DO NOTHING
        """,
        (user_id, DEFAULT_THEME, DEFAULT_FEED_SORT),
    )


def migrate_legacy_passwords(conn: sqlite3.Connection) -> None:
    rows = conn.execute("SELECT id, password FROM users").fetchall()
    for row in rows:
        password = row["password"] or ""
        if not password.startswith("pbkdf2_sha256$"):
            conn.execute(
                "UPDATE users SET password = ? WHERE id = ?",
                (hash_password(password), row["id"]),
            )
    conn.commit()


def ensure_seed_users(conn: sqlite3.Connection) -> dict[str, int]:
    user_ids: dict[str, int] = {}
    for seed_user in SEED_USERS:
        email = seed_user["email"]
        display_name = seed_user.get("display_name") or build_default_display_name(email)
        row = conn.execute("SELECT id, password, display_name FROM users WHERE email = ?", (email,)).fetchone()
        if row is None:
            cursor = conn.execute(
                """
                INSERT INTO users (email, password, role, display_name, avatar_data_url, is_active, created_at)
                VALUES (?, ?, ?, ?, '', 1, ?)
                """,
                (email, hash_password(seed_user["password"]), seed_user["role"], display_name, utc_now()),
            )
            user_id = int(cursor.lastrowid)
        else:
            user_id = int(row["id"])
            conn.execute(
                "UPDATE users SET role = ?, is_active = 1, display_name = COALESCE(NULLIF(display_name, ''), ?) WHERE id = ?",
                (seed_user["role"], display_name, user_id),
            )
            if not verify_password(seed_user["password"], row["password"]):
                conn.execute(
                    "UPDATE users SET password = ? WHERE id = ?",
                    (hash_password(seed_user["password"]), user_id),
                )
        ensure_user_settings(conn, user_id)
        user_ids[email] = user_id
    conn.commit()
    return user_ids


def seed_exists(conn: sqlite3.Connection, table: str, record_id: int, seed_key: str | None) -> bool:
    if seed_key:
        row = conn.execute(
            f"SELECT 1 FROM {table} WHERE seed_key = ? OR id = ? LIMIT 1",
            (seed_key, record_id),
        ).fetchone()
    else:
        row = conn.execute(f"SELECT 1 FROM {table} WHERE id = ? LIMIT 1", (record_id,)).fetchone()
    return row is not None


def ensure_seed_posts(conn: sqlite3.Connection, user_ids: dict[str, int]) -> None:
    pending_row = conn.execute("SELECT seed_key FROM posts WHERE id = 2").fetchone()
    if pending_row is not None and not pending_row["seed_key"]:
        conn.execute("UPDATE posts SET seed_key = ? WHERE id = 2", (SEED_PENDING_POST["seed_key"],))

    for post in SEED_POSTS:
        if seed_exists(conn, "posts", post["id"], post["seed_key"]):
            continue
        conn.execute(
            """
            INSERT INTO posts (
              id,
              user_id,
              title,
              content,
              format,
              why_matters,
              hoped_conversation,
              category,
              sensitivity,
              declaration_accepted,
              status,
              parent_post_id,
              source_comment_id,
              promoted_by,
              promoted_at,
              approved_by,
              created_at,
              updated_at,
              approved_at,
              seed_key,
              review_note,
              last_submitted_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', ?)
            """,
            (
                post["id"],
                user_ids[post["user_email"]],
                post["title"],
                post["content"],
                post["format"],
                post["why_matters"],
                post["hoped_conversation"],
                post["category"],
                post["sensitivity"],
                post["status"],
                post.get("parent_post_id"),
                post.get("source_comment_id"),
                user_ids.get(post.get("promoted_by_email")) if post.get("promoted_by_email") else None,
                post.get("promoted_at"),
                user_ids.get(post.get("approved_by_email")) if post.get("approved_by_email") else None,
                post["created_at"],
                post["created_at"],
                post.get("approved_at"),
                post["seed_key"],
                post["created_at"],
            ),
        )

    if not seed_exists(conn, "posts", SEED_PENDING_POST["id"], SEED_PENDING_POST["seed_key"]):
        conn.execute(
            """
            INSERT INTO posts (
              id,
              user_id,
              title,
              content,
              format,
              why_matters,
              hoped_conversation,
              category,
              sensitivity,
              declaration_accepted,
              status,
              created_at,
              updated_at,
              seed_key,
              review_note,
              last_submitted_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, '', ?)
            """,
            (
                SEED_PENDING_POST["id"],
                user_ids[SEED_PENDING_POST["user_email"]],
                SEED_PENDING_POST["title"],
                SEED_PENDING_POST["content"],
                SEED_PENDING_POST["format"],
                SEED_PENDING_POST["why_matters"],
                SEED_PENDING_POST["hoped_conversation"],
                SEED_PENDING_POST["category"],
                SEED_PENDING_POST["sensitivity"],
                SEED_PENDING_POST["status"],
                SEED_PENDING_POST["created_at"],
                SEED_PENDING_POST["created_at"],
                SEED_PENDING_POST["seed_key"],
                SEED_PENDING_POST["created_at"],
            ),
        )
    conn.commit()


def ensure_seed_comments(conn: sqlite3.Connection, user_ids: dict[str, int]) -> None:
    for comment in SEED_COMMENTS:
        if seed_exists(conn, "comments", comment["id"], comment["seed_key"]):
            continue
        conn.execute(
            """
            INSERT INTO comments (
              id,
              post_id,
              user_id,
              parent_comment_id,
              response_type,
              status,
              content,
              created_at,
              updated_at,
              like_count,
              resonates_count,
              discuss_count,
              seed_key
            )
            VALUES (?, ?, ?, NULL, ?, 'active', ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                comment["id"],
                comment["post_id"],
                user_ids[comment["user_email"]],
                comment["response_type"],
                comment["content"],
                comment["created_at"],
                comment["created_at"],
                comment["like_count"],
                comment["resonates_count"],
                comment["discuss_count"],
                comment["seed_key"],
            ),
        )
    conn.commit()


def initialize_database() -> None:
    with connect_db() as conn:
        ensure_schema(conn)
        migrate_legacy_passwords(conn)
        user_ids = ensure_seed_users(conn)
        ensure_seed_posts(conn, user_ids)
        ensure_seed_comments(conn, user_ids)
        conn.commit()


def session_redirect_for_role(role: str) -> str:
    return "admin.html" if role == "admin" else "user.html"


def serialize_settings(row: sqlite3.Row | None) -> dict[str, Any]:
    if row is None:
        return {
            "theme": DEFAULT_THEME,
            "reviewUpdatesEnabled": True,
            "weeklyDigestEnabled": False,
            "defaultFeedSort": DEFAULT_FEED_SORT,
            "hideHighSensitivity": False,
        }
    return {
        "theme": row["theme"] if row["theme"] in THEMES else DEFAULT_THEME,
        "reviewUpdatesEnabled": bool(row["review_updates_enabled"]),
        "weeklyDigestEnabled": bool(row["weekly_digest_enabled"]),
        "defaultFeedSort": row["default_feed_sort"] or DEFAULT_FEED_SORT,
        "hideHighSensitivity": bool(row["hide_high_sensitivity"]),
    }


def get_current_user(conn: sqlite3.Connection, handler: BaseHTTPRequestHandler) -> sqlite3.Row | None:
    cookie_header = handler.headers.get("Cookie", "")
    if not cookie_header:
        return None
    jar = cookies.SimpleCookie()
    jar.load(cookie_header)
    morsel = jar.get(SESSION_COOKIE_NAME)
    if morsel is None:
        return None
    session_id = morsel.value
    row = conn.execute(
        """
        SELECT users.*
        FROM sessions
        JOIN users ON users.id = sessions.user_id
        WHERE sessions.id = ? AND sessions.expires_at > ?
        """,
        (session_id, utc_now()),
    ).fetchone()
    if row is None:
        conn.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
        conn.commit()
    return row


def get_session_id(handler: BaseHTTPRequestHandler) -> str | None:
    cookie_header = handler.headers.get("Cookie", "")
    if not cookie_header:
        return None
    jar = cookies.SimpleCookie()
    jar.load(cookie_header)
    morsel = jar.get(SESSION_COOKIE_NAME)
    return morsel.value if morsel else None


def create_session(conn: sqlite3.Connection, user_id: int) -> tuple[str, str]:
    session_id = secrets.token_urlsafe(32)
    expires_at = (datetime.now(timezone.utc) + SESSION_DURATION).isoformat(timespec="seconds").replace("+00:00", "Z")
    conn.execute(
        "INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
        (session_id, user_id, utc_now(), expires_at),
    )
    conn.commit()
    return session_id, expires_at


def clear_session(conn: sqlite3.Connection, session_id: str | None) -> None:
    if not session_id:
        return
    conn.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
    conn.commit()


def load_posts(conn: sqlite3.Connection) -> list[dict[str, Any]]:
    rows = conn.execute(
        """
        SELECT
          posts.*,
          owner.email AS user_email,
          promoted.email AS promoted_email,
          approved.email AS approved_email,
          rejected.email AS rejected_email,
          revised.email AS revised_email
        FROM posts
        JOIN users AS owner ON owner.id = posts.user_id
        LEFT JOIN users AS promoted ON promoted.id = posts.promoted_by
        LEFT JOIN users AS approved ON approved.id = posts.approved_by
        LEFT JOIN users AS rejected ON rejected.id = posts.rejected_by
        LEFT JOIN users AS revised ON revised.id = posts.revision_requested_by
        ORDER BY CASE WHEN posts.approved_at IS NOT NULL THEN posts.approved_at ELSE posts.created_at END DESC, posts.id DESC
        """
    ).fetchall()

    payload: list[dict[str, Any]] = []
    for row in rows:
        payload.append(
            {
                "id": row["id"],
                "seedKey": row["seed_key"] or "",
                "userEmail": row["user_email"],
                "title": row["title"],
                "content": row["content"],
                "format": row["format"],
                "whyMatters": row["why_matters"] or "",
                "hopedConversation": row["hoped_conversation"] or "",
                "category": row["category"] or "General",
                "sensitivity": row["sensitivity"] or "medium",
                "declarationAccepted": bool(row["declaration_accepted"]),
                "status": row["status"],
                "parentPostId": row["parent_post_id"],
                "sourceCommentId": row["source_comment_id"],
                "promotedBy": row["promoted_email"],
                "promotedAt": row["promoted_at"],
                "approvedBy": row["approved_email"],
                "rejectedBy": row["rejected_email"],
                "revisionRequestedBy": row["revised_email"],
                "createdAt": row["created_at"],
                "updatedAt": row["updated_at"],
                "approvedAt": row["approved_at"],
                "rejectedAt": row["rejected_at"],
                "revisionRequestedAt": row["revision_requested_at"],
                "reviewNote": row["review_note"] or "",
                "mediaType": row["media_type"] or "",
                "mediaMimeType": row["media_mime_type"] or "",
                "mediaName": row["media_name"] or "",
                "mediaDataUrl": row["media_data_url"] or "",
            }
        )
    return payload


def load_comments(conn: sqlite3.Connection) -> list[dict[str, Any]]:
    rows = conn.execute(
        """
        SELECT comments.*, users.email AS user_email
        FROM comments
        JOIN users ON users.id = comments.user_id
        ORDER BY comments.created_at DESC, comments.id DESC
        """
    ).fetchall()

    comments_by_id: dict[int, dict[str, Any]] = {}
    for row in rows:
        comments_by_id[int(row["id"])] = {
            "id": row["id"],
            "seedKey": row["seed_key"] or "",
            "postId": row["post_id"],
            "userEmail": row["user_email"],
            "responseType": row["response_type"],
            "parentResponseId": row["parent_comment_id"],
            "content": row["content"],
            "likedBy": [],
            "resonatedBy": [],
            "discussedBy": [],
            "flaggedBy": [],
            "reports": [],
            "likeCount": int(row["like_count"] or 0),
            "resonatesCount": int(row["resonates_count"] or 0),
            "discussCount": int(row["discuss_count"] or 0),
            "flagCount": 0,
            "status": row["status"],
            "createdAt": row["created_at"],
        }

    interaction_rows = conn.execute(
        """
        SELECT comment_interactions.comment_id, comment_interactions.interaction_type, users.email AS user_email
        FROM comment_interactions
        JOIN users ON users.id = comment_interactions.user_id
        """
    ).fetchall()
    for row in interaction_rows:
        entry = comments_by_id.get(int(row["comment_id"]))
        if entry is None:
            continue
        email = row["user_email"]
        action = row["interaction_type"]
        if action == "like" and email not in entry["likedBy"]:
            entry["likedBy"].append(email)
        if action == "resonate" and email not in entry["resonatedBy"]:
            entry["resonatedBy"].append(email)
        if action == "discuss" and email not in entry["discussedBy"]:
            entry["discussedBy"].append(email)

    report_rows = conn.execute(
        """
        SELECT
          comment_reports.id,
          comment_reports.comment_id,
          comment_reports.reason,
          comment_reports.urgency,
          comment_reports.details,
          comment_reports.created_at,
          users.email AS user_email
        FROM comment_reports
        JOIN users ON users.id = comment_reports.reporter_id
        WHERE comment_reports.status = 'open'
        ORDER BY comment_reports.created_at DESC, comment_reports.id DESC
        """
    ).fetchall()
    for row in report_rows:
        entry = comments_by_id.get(int(row["comment_id"]))
        if entry is None:
            continue
        entry["reports"].append(
            {
                "id": row["id"],
                "reporterEmail": row["user_email"],
                "reason": row["reason"],
                "urgency": row["urgency"],
                "details": row["details"],
                "createdAt": row["created_at"],
            }
        )
        entry["flaggedBy"].append(row["user_email"])

    for entry in comments_by_id.values():
        entry["likeCount"] += len(entry["likedBy"])
        entry["resonatesCount"] += len(entry["resonatedBy"])
        entry["discussCount"] += len(entry["discussedBy"])
        entry["flagCount"] = len(entry["reports"])

    return list(comments_by_id.values())


def load_bookmarks(conn: sqlite3.Connection, user_id: int | None) -> list[int]:
    if user_id is None:
        return []
    rows = conn.execute("SELECT post_id FROM user_bookmarks WHERE user_id = ?", (user_id,)).fetchall()
    return [int(row["post_id"]) for row in rows]


def load_dismissed_notifications(conn: sqlite3.Connection, user_id: int | None) -> list[int]:
    if user_id is None:
        return []
    rows = conn.execute("SELECT post_id FROM dismissed_notifications WHERE user_id = ?", (user_id,)).fetchall()
    return [int(row["post_id"]) for row in rows]


def load_response_drafts(conn: sqlite3.Connection, user_id: int | None) -> dict[str, dict[str, Any]]:
    if user_id is None:
        return {}
    rows = conn.execute(
        "SELECT post_id, response_type, content, updated_at FROM response_drafts WHERE user_id = ?",
        (user_id,),
    ).fetchall()
    return {
        str(int(row["post_id"])): {
            "responseType": row["response_type"],
            "content": row["content"],
            "updatedAt": row["updated_at"],
        }
        for row in rows
        if row["content"]
    }


def load_settings(conn: sqlite3.Connection, user_id: int | None) -> dict[str, Any]:
    if user_id is None:
        return serialize_settings(None)
    row = conn.execute("SELECT * FROM user_settings WHERE user_id = ?", (user_id,)).fetchone()
    return serialize_settings(row)


def build_state_payload(conn: sqlite3.Connection, user: sqlite3.Row | None) -> dict[str, Any]:
    user_id = int(user["id"]) if user is not None else None
    session = None
    if user is not None:
        session = {
            "id": user["id"],
            "email": user["email"],
            "role": user["role"],
            "displayName": (user["display_name"] or "").strip() or build_default_display_name(user["email"]),
            "avatarDataUrl": user["avatar_data_url"] or "",
            "redirect": session_redirect_for_role(user["role"]),
        }
    return {
        "session": session,
        "posts": load_posts(conn),
        "comments": load_comments(conn),
        "bookmarks": load_bookmarks(conn, user_id),
        "dismissedNotifications": load_dismissed_notifications(conn, user_id),
        "responseDrafts": load_response_drafts(conn, user_id),
        "settings": load_settings(conn, user_id),
    }


def parse_json_body(handler: BaseHTTPRequestHandler) -> dict[str, Any]:
    length = int(handler.headers.get("Content-Length", "0") or 0)
    if length <= 0:
        return {}
    raw = handler.rfile.read(length)
    if not raw:
        return {}
    try:
        return json.loads(raw.decode("utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError("Invalid JSON body.") from exc


class ApiError(Exception):
    def __init__(self, status: int, message: str) -> None:
        super().__init__(message)
        self.status = status
        self.message = message


class AnonymuseHandler(BaseHTTPRequestHandler):
    server_version = "Anonymuse/1.0"

    def log_message(self, format: str, *args: Any) -> None:
        return

    def respond_json(
        self,
        status: int,
        payload: dict[str, Any],
        *,
        set_cookie: tuple[str, str] | None = None,
        clear_cookie: bool = False,
    ) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        if set_cookie is not None:
            session_id, expires_at = set_cookie
            expires_at_dt = parse_timestamp(expires_at)
            jar = cookies.SimpleCookie()
            jar[SESSION_COOKIE_NAME] = session_id
            jar[SESSION_COOKIE_NAME]["path"] = "/"
            jar[SESSION_COOKIE_NAME]["httponly"] = True
            jar[SESSION_COOKIE_NAME]["samesite"] = "Lax"
            if expires_at_dt is not None:
                jar[SESSION_COOKIE_NAME]["expires"] = http_cookie_timestamp(expires_at_dt)
            self.send_header("Set-Cookie", jar.output(header="").strip())
        if clear_cookie:
            jar = cookies.SimpleCookie()
            jar[SESSION_COOKIE_NAME] = ""
            jar[SESSION_COOKIE_NAME]["path"] = "/"
            jar[SESSION_COOKIE_NAME]["expires"] = "Thu, 01 Jan 1970 00:00:00 GMT"
            jar[SESSION_COOKIE_NAME]["max-age"] = "0"
            jar[SESSION_COOKIE_NAME]["httponly"] = True
            jar[SESSION_COOKIE_NAME]["samesite"] = "Lax"
            self.send_header("Set-Cookie", jar.output(header="").strip())
        self.end_headers()
        self.wfile.write(body)

    def respond_state(
        self,
        conn: sqlite3.Connection,
        user: sqlite3.Row | None,
        *,
        status: int = 200,
        set_cookie: tuple[str, str] | None = None,
        clear_cookie: bool = False,
    ) -> None:
        self.respond_json(
            status,
            build_state_payload(conn, user),
            set_cookie=set_cookie,
            clear_cookie=clear_cookie,
        )

    def respond_error(self, status: int, message: str) -> None:
        self.respond_json(status, {"error": message})

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            try:
                with connect_db() as conn:
                    user = get_current_user(conn, self)
                    if parsed.path == "/api/bootstrap":
                        self.respond_state(conn, user)
                        return
                    raise ApiError(404, "Not found.")
            except ApiError as exc:
                self.respond_error(exc.status, exc.message)
            return
        self.serve_static_file(parsed.path)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if not parsed.path.startswith("/api/"):
            self.respond_error(404, "Not found.")
            return

        try:
            body = parse_json_body(self)
        except ValueError as exc:
            self.respond_error(400, str(exc))
            return

        try:
            with connect_db() as conn:
                user = get_current_user(conn, self)
                route = parsed.path

                if route == "/api/login":
                    self.handle_login(conn, body)
                    return
                if route == "/api/signup":
                    self.handle_signup(conn, body)
                    return
                if route == "/api/logout":
                    self.handle_logout(conn)
                    return
                if route == "/api/posts":
                    self.require_user(user)
                    self.handle_post_upsert(conn, user, body)
                    return
                if route == "/api/comments":
                    self.require_user(user)
                    self.handle_comment_create(conn, user, body)
                    return
                if route == "/api/user/settings":
                    self.require_user(user)
                    self.handle_settings_update(conn, user, body)
                    return
                if route == "/api/user/password":
                    self.require_user(user)
                    self.handle_password_update(conn, user, body)
                    return
                if route == "/api/user/bookmarks/toggle":
                    self.require_user(user)
                    self.handle_bookmark_toggle(conn, user, body)
                    return
                if route == "/api/user/notifications/dismiss":
                    self.require_user(user)
                    self.handle_notification_dismiss(conn, user, body)
                    return
                if route == "/api/user/drafts":
                    self.require_user(user)
                    self.handle_draft_update(conn, user, body)
                    return
                if route.startswith("/api/comments/") and route.endswith("/signal"):
                    self.require_user(user)
                    comment_id = self.parse_route_id(route, "/api/comments/", "/signal")
                    self.handle_comment_signal(conn, user, comment_id, body)
                    return
                if route.startswith("/api/comments/") and route.endswith("/report"):
                    self.require_user(user)
                    comment_id = self.parse_route_id(route, "/api/comments/", "/report")
                    self.handle_comment_report(conn, user, comment_id, body)
                    return
                if route.startswith("/api/comments/") and route.endswith("/sub-musing"):
                    self.require_user(user)
                    comment_id = self.parse_route_id(route, "/api/comments/", "/sub-musing")
                    self.handle_sub_musing_request(conn, user, comment_id)
                    return
                if route.startswith("/api/admin/posts/") and route.endswith("/moderate"):
                    self.require_admin(user)
                    post_id = self.parse_route_id(route, "/api/admin/posts/", "/moderate")
                    self.handle_post_moderation(conn, user, post_id, body)
                    return
                if route.startswith("/api/admin/comments/") and route.endswith("/reports"):
                    self.require_admin(user)
                    comment_id = self.parse_route_id(route, "/api/admin/comments/", "/reports")
                    self.handle_report_resolution(conn, user, comment_id, body)
                    return
                raise ApiError(404, "Not found.")
        except ApiError as exc:
            self.respond_error(exc.status, exc.message)

    def serve_static_file(self, path: str) -> None:
        target_path = path or "/"
        if target_path == "/":
            target_path = "/index.html"
        file_path = (BASE_DIR / target_path.lstrip("/")).resolve()
        if BASE_DIR not in file_path.parents and file_path != BASE_DIR:
            self.send_error(403)
            return
        if not file_path.is_file() or file_path.suffix.lower() not in ALLOWED_STATIC_SUFFIXES:
            self.send_error(404)
            return
        body = file_path.read_bytes()
        content_type, _ = mimetypes.guess_type(str(file_path))
        self.send_response(200)
        self.send_header("Content-Type", (content_type or "application/octet-stream") + "; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def parse_route_id(self, path: str, prefix: str, suffix: str) -> int:
        value = path[len(prefix) : len(path) - len(suffix)]
        try:
            return int(value)
        except ValueError as exc:
            raise ApiError(400, "Invalid identifier.") from exc

    def require_user(self, user: sqlite3.Row | None) -> sqlite3.Row:
        if user is None or user["role"] != "user":
            raise ApiError(403, "User access required.")
        return user

    def require_admin(self, user: sqlite3.Row | None) -> sqlite3.Row:
        if user is None or user["role"] != "admin":
            raise ApiError(403, "Admin access required.")
        return user

    def handle_login(self, conn: sqlite3.Connection, body: dict[str, Any]) -> None:
        email = normalize_email(body.get("email"))
        password = str(body.get("password") or "")
        if not email or not password:
            raise ApiError(400, "Email and password are required.")
        user = conn.execute(
            "SELECT * FROM users WHERE email = ? AND is_active = 1",
            (email,),
        ).fetchone()
        if user is None or not verify_password(password, user["password"]):
            raise ApiError(401, "Invalid email or password.")
        self.respond_state(conn, user, set_cookie=create_session(conn, int(user["id"])))

    def handle_signup(self, conn: sqlite3.Connection, body: dict[str, Any]) -> None:
        email = normalize_email(body.get("email"))
        password = str(body.get("password") or "")
        confirm_password = str(body.get("confirmPassword") or "")
        display_name = str(body.get("displayName") or "").strip() or build_default_display_name(email)
        if not email or "@" not in email:
            raise ApiError(400, "Enter a valid email address.")
        if len(password) < 8:
            raise ApiError(400, "Passwords must be at least 8 characters.")
        if password != confirm_password:
            raise ApiError(400, "Passwords do not match.")
        if conn.execute("SELECT 1 FROM users WHERE email = ?", (email,)).fetchone() is not None:
            raise ApiError(409, "An account with this email already exists.")
        cursor = conn.execute(
            """
            INSERT INTO users (email, password, role, display_name, avatar_data_url, is_active, created_at)
            VALUES (?, ?, 'user', ?, '', 1, ?)
            """,
            (email, hash_password(password), display_name, utc_now()),
        )
        user_id = int(cursor.lastrowid)
        ensure_user_settings(conn, user_id)
        conn.commit()
        user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        self.respond_state(conn, user, status=201, set_cookie=create_session(conn, user_id))

    def handle_logout(self, conn: sqlite3.Connection) -> None:
        clear_session(conn, get_session_id(self))
        self.respond_state(conn, None, clear_cookie=True)

    def handle_post_upsert(self, conn: sqlite3.Connection, user: sqlite3.Row, body: dict[str, Any]) -> None:
        title = str(body.get("title") or "").strip()
        content = str(body.get("content") or "").strip()
        media_type = str(body.get("mediaType") or "").strip().lower()
        media_mime_type = str(body.get("mediaMimeType") or "").strip()
        media_name = str(body.get("mediaName") or "").strip()
        media_data_url = str(body.get("mediaDataUrl") or "").strip()
        why_matters = str(body.get("whyMatters") or "").strip()
        hoped_conversation = str(body.get("hopedConversation") or "").strip()
        category = str(body.get("category") or "").strip()
        sensitivity = str(body.get("sensitivity") or "").strip().lower()
        declaration_accepted = bool(body.get("declarationAccepted"))
        post_id = body.get("id")

        if not all([title, content, media_type, why_matters, hoped_conversation, category, sensitivity]):
            raise ApiError(400, "Complete all musing fields before submitting.")
        if media_type not in MEDIA_TYPES:
            raise ApiError(400, "Unsupported media type.")
        if sensitivity not in {"low", "medium", "high"}:
            raise ApiError(400, "Unsupported sensitivity level.")
        if not declaration_accepted:
            raise ApiError(400, "You must confirm the reflection declaration.")
        if count_words(content) > 170:
            raise ApiError(400, "Keep the transcript close to a one-minute reflection.")
        if media_data_url:
            approximate_size = int((len(media_data_url.split(",", 1)[-1]) * 3) / 4)
            if approximate_size > MEDIA_UPLOAD_LIMIT_BYTES:
                raise ApiError(400, "Uploaded media must be 4 MB or smaller.")

        now = utc_now()
        if post_id not in (None, "", 0):
            try:
                normalized_post_id = int(post_id)
            except (TypeError, ValueError) as exc:
                raise ApiError(400, "Invalid post identifier.") from exc
            existing = conn.execute(
                "SELECT * FROM posts WHERE id = ? AND user_id = ?",
                (normalized_post_id, int(user["id"])),
            ).fetchone()
            if existing is None:
                raise ApiError(404, "Post not found.")
            if existing["status"] not in {"pending", "revision_requested", "rejected"}:
                raise ApiError(409, "This post can no longer be edited from the user side.")
            conn.execute(
                """
                UPDATE posts
                SET
                  title = ?,
                  content = ?,
                  format = ?,
                  why_matters = ?,
                  hoped_conversation = ?,
                  category = ?,
                  sensitivity = ?,
                  declaration_accepted = ?,
                  status = 'pending',
                  media_type = ?,
                  media_mime_type = ?,
                  media_name = ?,
                  media_data_url = ?,
                  approved_by = NULL,
                  approved_at = NULL,
                  rejected_by = NULL,
                  rejected_at = NULL,
                  revision_requested_by = NULL,
                  revision_requested_at = NULL,
                  review_note = '',
                  updated_at = ?,
                  last_submitted_at = ?
                WHERE id = ?
                """,
                (
                    title,
                    content,
                    format_for_media_type(media_type),
                    why_matters,
                    hoped_conversation,
                    category,
                    sensitivity,
                    1 if declaration_accepted else 0,
                    media_type,
                    media_mime_type,
                    media_name,
                    media_data_url,
                    now,
                    now,
                    normalized_post_id,
                ),
            )
            conn.execute(
                "DELETE FROM dismissed_notifications WHERE user_id = ? AND post_id = ?",
                (int(user["id"]), normalized_post_id),
            )
        else:
            conn.execute(
                """
                INSERT INTO posts (
                  user_id,
                  title,
                  content,
                  format,
                  why_matters,
                  hoped_conversation,
                  category,
                  sensitivity,
                  declaration_accepted,
                  status,
                  created_at,
                  updated_at,
                  media_type,
                  media_mime_type,
                  media_name,
                  media_data_url,
                  review_note,
                  last_submitted_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, '', ?)
                """,
                (
                    int(user["id"]),
                    title,
                    content,
                    format_for_media_type(media_type),
                    why_matters,
                    hoped_conversation,
                    category,
                    sensitivity,
                    1 if declaration_accepted else 0,
                    now,
                    now,
                    media_type,
                    media_mime_type,
                    media_name,
                    media_data_url,
                    now,
                ),
            )
        conn.commit()
        self.respond_state(conn, user)

    def handle_comment_create(self, conn: sqlite3.Connection, user: sqlite3.Row, body: dict[str, Any]) -> None:
        try:
            post_id = int(body.get("postId"))
        except (TypeError, ValueError) as exc:
            raise ApiError(400, "Invalid post identifier.") from exc
        content = str(body.get("content") or "").strip()
        if not content:
            raise ApiError(400, "Enter your response before submitting.")
        if count_words(content) > RESPONSE_WORD_LIMIT:
            raise ApiError(400, f"Responses are limited to {RESPONSE_WORD_LIMIT} words.")

        parent_response_id = body.get("parentResponseId")
        if parent_response_id in ("", None):
            response_type = str(body.get("responseType") or "").strip()
            if response_type not in RESPONSE_TYPES:
                raise ApiError(400, "Select a stream before submitting.")
            normalized_parent_id = None
            stored_response_type = response_type
        else:
            try:
                normalized_parent_id = int(parent_response_id)
            except (TypeError, ValueError) as exc:
                raise ApiError(400, "This reply target is unavailable.") from exc
            parent = conn.execute(
                "SELECT id, post_id, status FROM comments WHERE id = ?",
                (normalized_parent_id,),
            ).fetchone()
            if parent is None or int(parent["post_id"]) != post_id or parent["status"] == "removed":
                raise ApiError(404, "The response you are commenting on is no longer available.")
            stored_response_type = "reply"

        if conn.execute("SELECT id FROM posts WHERE id = ?", (post_id,)).fetchone() is None:
            raise ApiError(404, "Post not found.")

        now = utc_now()
        conn.execute(
            """
            INSERT INTO comments (
              post_id,
              user_id,
              parent_comment_id,
              response_type,
              status,
              content,
              created_at,
              updated_at,
              like_count,
              resonates_count,
              discuss_count
            )
            VALUES (?, ?, ?, ?, 'active', ?, ?, ?, 0, 0, 0)
            """,
            (
                post_id,
                int(user["id"]),
                normalized_parent_id,
                stored_response_type,
                content,
                now,
                now,
            ),
        )
        if normalized_parent_id is None:
            conn.execute(
                "DELETE FROM response_drafts WHERE user_id = ? AND post_id = ?",
                (int(user["id"]), post_id),
            )
        conn.commit()
        self.respond_state(conn, user)

    def handle_comment_signal(self, conn: sqlite3.Connection, user: sqlite3.Row, comment_id: int, body: dict[str, Any]) -> None:
        action = str(body.get("action") or "").strip()
        action_map = {
            "like-response": "like",
            "signal-resonate": "resonate",
            "signal-discuss": "discuss",
        }
        interaction_type = action_map.get(action)
        if interaction_type is None:
            raise ApiError(400, "Unsupported response action.")
        comment = conn.execute("SELECT id, status FROM comments WHERE id = ?", (comment_id,)).fetchone()
        if comment is None or comment["status"] == "removed":
            raise ApiError(404, "Comment not found.")
        conn.execute(
            """
            INSERT OR IGNORE INTO comment_interactions (comment_id, user_id, interaction_type, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (comment_id, int(user["id"]), interaction_type, utc_now()),
        )
        conn.commit()
        self.respond_state(conn, user)

    def handle_comment_report(self, conn: sqlite3.Connection, user: sqlite3.Row, comment_id: int, body: dict[str, Any]) -> None:
        reason = str(body.get("reason") or "").strip()
        urgency = str(body.get("urgency") or "").strip()
        details = str(body.get("details") or "").strip()
        if reason not in REPORT_REASONS:
            raise ApiError(400, "Select a reason type before submitting your report.")
        if urgency not in REPORT_URGENCY:
            raise ApiError(400, "Select a review urgency level.")
        if len(details) < REPORT_DETAIL_MIN_CHARS:
            raise ApiError(400, f"Please provide at least {REPORT_DETAIL_MIN_CHARS} characters describing the issue.")
        comment = conn.execute("SELECT id, status FROM comments WHERE id = ?", (comment_id,)).fetchone()
        if comment is None or comment["status"] == "removed":
            raise ApiError(404, "Comment not found.")
        conn.execute(
            """
            INSERT OR IGNORE INTO comment_reports (
              comment_id,
              reporter_id,
              reason,
              urgency,
              details,
              status,
              created_at
            )
            VALUES (?, ?, ?, ?, ?, 'open', ?)
            """,
            (comment_id, int(user["id"]), reason, urgency, details, utc_now()),
        )
        conn.commit()
        self.respond_state(conn, user)

    def handle_sub_musing_request(self, conn: sqlite3.Connection, user: sqlite3.Row, comment_id: int) -> None:
        response = conn.execute(
            """
            SELECT comments.*, posts.parent_post_id, posts.category, posts.sensitivity, posts.title AS post_title
            FROM comments
            JOIN posts ON posts.id = comments.post_id
            WHERE comments.id = ? AND comments.status != 'removed'
            """,
            (comment_id,),
        ).fetchone()
        if response is None:
            raise ApiError(404, "The selected response is no longer available.")
        if response["parent_comment_id"] is not None:
            raise ApiError(400, "Only top-level responses can be forwarded into sub-musings.")
        if response["parent_post_id"] is not None:
            raise ApiError(400, "Sub-musings cannot be nested further.")
        existing = conn.execute(
            """
            SELECT id
            FROM posts
            WHERE
              user_id = ?
              AND source_comment_id = ?
              AND parent_post_id = ?
              AND status IN ('pending', 'revision_requested', 'approved')
            LIMIT 1
            """,
            (int(user["id"]), comment_id, int(response["post_id"])),
        ).fetchone()
        if existing is not None:
            self.respond_state(conn, user)
            return
        now = utc_now()
        conn.execute(
            """
            INSERT INTO posts (
              user_id,
              title,
              content,
              format,
              why_matters,
              hoped_conversation,
              category,
              sensitivity,
              declaration_accepted,
              status,
              parent_post_id,
              source_comment_id,
              promoted_by,
              promoted_at,
              created_at,
              updated_at,
              review_note,
              last_submitted_at
            )
            VALUES (?, ?, ?, 'Text sub-musing', ?, ?, ?, ?, 1, 'pending', ?, ?, ?, ?, ?, ?, '', ?)
            """,
            (
                int(user["id"]),
                f"Sub-musing: {response['post_title']}",
                response["content"],
                "Promoted from a community response for deeper discernment.",
                "How should this follow-up insight deepen the main musing conversation?",
                response["category"] or "General",
                response["sensitivity"] or "medium",
                int(response["post_id"]),
                comment_id,
                int(user["id"]),
                now,
                now,
                now,
                now,
            ),
        )
        conn.commit()
        self.respond_state(conn, user)

    def handle_post_moderation(self, conn: sqlite3.Connection, user: sqlite3.Row, post_id: int, body: dict[str, Any]) -> None:
        action = str(body.get("action") or "").strip()
        note = str(body.get("note") or "").strip()
        if action not in {"approve", "revise", "reject"}:
            raise ApiError(400, "Unsupported moderation action.")
        post = conn.execute("SELECT * FROM posts WHERE id = ?", (post_id,)).fetchone()
        if post is None:
            raise ApiError(404, "Post not found.")
        if action in {"revise", "reject"} and len(note) < 12:
            raise ApiError(400, "Please leave a short moderation note for revision or rejection.")
        now = utc_now()
        if action == "approve":
            conn.execute(
                """
                UPDATE posts
                SET
                  status = 'approved',
                  approved_by = ?,
                  approved_at = ?,
                  rejected_by = NULL,
                  rejected_at = NULL,
                  revision_requested_by = NULL,
                  revision_requested_at = NULL,
                  review_note = ?,
                  updated_at = ?
                WHERE id = ?
                """,
                (int(user["id"]), now, note, now, post_id),
            )
        elif action == "revise":
            conn.execute(
                """
                UPDATE posts
                SET
                  status = 'revision_requested',
                  approved_by = NULL,
                  approved_at = NULL,
                  rejected_by = NULL,
                  rejected_at = NULL,
                  revision_requested_by = ?,
                  revision_requested_at = ?,
                  review_note = ?,
                  updated_at = ?
                WHERE id = ?
                """,
                (int(user["id"]), now, note, now, post_id),
            )
        else:
            conn.execute(
                """
                UPDATE posts
                SET
                  status = 'rejected',
                  approved_by = NULL,
                  approved_at = NULL,
                  rejected_by = ?,
                  rejected_at = ?,
                  revision_requested_by = NULL,
                  revision_requested_at = NULL,
                  review_note = ?,
                  updated_at = ?
                WHERE id = ?
                """,
                (int(user["id"]), now, note, now, post_id),
            )
        conn.commit()
        self.respond_state(conn, user)

    def handle_report_resolution(self, conn: sqlite3.Connection, user: sqlite3.Row, comment_id: int, body: dict[str, Any]) -> None:
        action = str(body.get("action") or "").strip()
        note = str(body.get("note") or "").strip()
        if action not in {"flag-keep", "flag-remove"}:
            raise ApiError(400, "Unsupported report action.")
        if conn.execute("SELECT id FROM comments WHERE id = ?", (comment_id,)).fetchone() is None:
            raise ApiError(404, "Comment not found.")
        now = utc_now()
        next_status = "kept" if action == "flag-keep" else "removed"
        conn.execute(
            """
            UPDATE comment_reports
            SET status = ?, resolution_note = ?, resolved_by = ?, resolved_at = ?
            WHERE comment_id = ? AND status = 'open'
            """,
            (next_status, note, int(user["id"]), now, comment_id),
        )
        if action == "flag-remove":
            conn.execute(
                "UPDATE comments SET status = 'removed', updated_at = ? WHERE id = ?",
                (now, comment_id),
            )
        conn.commit()
        self.respond_state(conn, user)

    def handle_settings_update(self, conn: sqlite3.Connection, user: sqlite3.Row, body: dict[str, Any]) -> None:
        ensure_user_settings(conn, int(user["id"]))
        current = conn.execute("SELECT * FROM user_settings WHERE user_id = ?", (int(user["id"]),)).fetchone()
        next_theme = current["theme"] if current else DEFAULT_THEME
        next_review_updates = bool(current["review_updates_enabled"]) if current else True
        next_weekly_digest = bool(current["weekly_digest_enabled"]) if current else False
        next_default_feed_sort = current["default_feed_sort"] if current else DEFAULT_FEED_SORT
        next_hide_high = bool(current["hide_high_sensitivity"]) if current else False
        next_display_name = str(user["display_name"] or "").strip() or build_default_display_name(user["email"])
        next_avatar_data_url = str(user["avatar_data_url"] or "")
        if body.get("theme") is not None:
            next_theme = str(body.get("theme")).strip()
            if next_theme not in THEMES:
                raise ApiError(400, "Unsupported theme.")
        if body.get("displayName") is not None:
            next_display_name = str(body.get("displayName") or "").strip()
            if len(next_display_name) < 2:
                raise ApiError(400, "Display names must be at least 2 characters.")
            if len(next_display_name) > 40:
                raise ApiError(400, "Display names must be 40 characters or fewer.")
        if body.get("avatarDataUrl") is not None:
            next_avatar_data_url = str(body.get("avatarDataUrl") or "").strip()
            if next_avatar_data_url:
                if not next_avatar_data_url.startswith("data:image/"):
                    raise ApiError(400, "Profile pictures must be image files.")
                approximate_size = int((len(next_avatar_data_url.split(",", 1)[-1]) * 3) / 4)
                if approximate_size > (2 * 1024 * 1024):
                    raise ApiError(400, "Profile pictures must be 2 MB or smaller.")
        if body.get("reviewUpdatesEnabled") is not None:
            next_review_updates = bool(body.get("reviewUpdatesEnabled"))
        if body.get("weeklyDigestEnabled") is not None:
            next_weekly_digest = bool(body.get("weeklyDigestEnabled"))
        if body.get("defaultFeedSort") is not None:
            next_default_feed_sort = str(body.get("defaultFeedSort")).strip()
            if next_default_feed_sort not in {"recent", "oldest", "depth", "discussion"}:
                raise ApiError(400, "Unsupported feed sort.")
        if body.get("hideHighSensitivity") is not None:
            next_hide_high = bool(body.get("hideHighSensitivity"))
        conn.execute(
            """
            INSERT INTO user_settings (
              user_id,
              theme,
              review_updates_enabled,
              weekly_digest_enabled,
              default_feed_sort,
              hide_high_sensitivity
            )
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
              theme = excluded.theme,
              review_updates_enabled = excluded.review_updates_enabled,
              weekly_digest_enabled = excluded.weekly_digest_enabled,
              default_feed_sort = excluded.default_feed_sort,
              hide_high_sensitivity = excluded.hide_high_sensitivity
            """,
            (
                int(user["id"]),
                next_theme,
                1 if next_review_updates else 0,
                1 if next_weekly_digest else 0,
                next_default_feed_sort,
                1 if next_hide_high else 0,
            ),
        )
        conn.execute(
            """
            UPDATE users
            SET display_name = ?, avatar_data_url = ?
            WHERE id = ?
            """,
            (next_display_name, next_avatar_data_url, int(user["id"])),
        )
        conn.commit()
        refreshed_user = conn.execute("SELECT * FROM users WHERE id = ?", (int(user["id"]),)).fetchone()
        self.respond_state(conn, refreshed_user)

    def handle_password_update(self, conn: sqlite3.Connection, user: sqlite3.Row, body: dict[str, Any]) -> None:
        current_password = str(body.get("currentPassword") or "")
        next_password = str(body.get("nextPassword") or "")
        confirm_password = str(body.get("confirmPassword") or "")
        if not verify_password(current_password, user["password"]):
            raise ApiError(400, "Your current password is incorrect.")
        if len(next_password) < 8:
            raise ApiError(400, "New passwords must be at least 8 characters.")
        if next_password != confirm_password:
            raise ApiError(400, "New passwords do not match.")
        conn.execute(
            "UPDATE users SET password = ? WHERE id = ?",
            (hash_password(next_password), int(user["id"])),
        )
        conn.commit()
        refreshed_user = conn.execute("SELECT * FROM users WHERE id = ?", (int(user["id"]),)).fetchone()
        self.respond_state(conn, refreshed_user)

    def handle_bookmark_toggle(self, conn: sqlite3.Connection, user: sqlite3.Row, body: dict[str, Any]) -> None:
        try:
            post_id = int(body.get("postId"))
        except (TypeError, ValueError) as exc:
            raise ApiError(400, "Invalid post identifier.") from exc
        existing = conn.execute(
            "SELECT 1 FROM user_bookmarks WHERE user_id = ? AND post_id = ?",
            (int(user["id"]), post_id),
        ).fetchone()
        if existing is None:
            conn.execute(
                "INSERT INTO user_bookmarks (user_id, post_id, created_at) VALUES (?, ?, ?)",
                (int(user["id"]), post_id, utc_now()),
            )
        else:
            conn.execute(
                "DELETE FROM user_bookmarks WHERE user_id = ? AND post_id = ?",
                (int(user["id"]), post_id),
            )
        conn.commit()
        self.respond_state(conn, user)

    def handle_notification_dismiss(self, conn: sqlite3.Connection, user: sqlite3.Row, body: dict[str, Any]) -> None:
        try:
            post_id = int(body.get("postId"))
        except (TypeError, ValueError) as exc:
            raise ApiError(400, "Invalid post identifier.") from exc
        conn.execute(
            """
            INSERT OR IGNORE INTO dismissed_notifications (user_id, post_id, created_at)
            VALUES (?, ?, ?)
            """,
            (int(user["id"]), post_id, utc_now()),
        )
        conn.commit()
        self.respond_state(conn, user)

    def handle_draft_update(self, conn: sqlite3.Connection, user: sqlite3.Row, body: dict[str, Any]) -> None:
        action = str(body.get("action") or "").strip()
        try:
            post_id = int(body.get("postId"))
        except (TypeError, ValueError) as exc:
            raise ApiError(400, "Invalid post identifier.") from exc
        if action == "clear":
            conn.execute(
                "DELETE FROM response_drafts WHERE user_id = ? AND post_id = ?",
                (int(user["id"]), post_id),
            )
            conn.commit()
            self.respond_state(conn, user)
            return
        if action != "save":
            raise ApiError(400, "Unsupported draft action.")
        response_type = str(body.get("responseType") or "").strip()
        content = str(body.get("content") or "")
        if response_type not in RESPONSE_TYPES:
            raise ApiError(400, "Select a stream before saving a draft.")
        if not content.strip():
            raise ApiError(400, "Type your response before saving a draft.")
        if count_words(content) > RESPONSE_WORD_LIMIT:
            raise ApiError(400, f"Responses are limited to {RESPONSE_WORD_LIMIT} words.")
        conn.execute(
            """
            INSERT INTO response_drafts (user_id, post_id, response_type, content, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(user_id, post_id) DO UPDATE SET
              response_type = excluded.response_type,
              content = excluded.content,
              updated_at = excluded.updated_at
            """,
            (int(user["id"]), post_id, response_type, content, utc_now()),
        )
        conn.commit()
        self.respond_state(conn, user)


def make_server(host: str = "127.0.0.1", port: int = 8000) -> ThreadingHTTPServer:
    initialize_database()
    return ThreadingHTTPServer((host, port), AnonymuseHandler)


def main() -> None:
    server = make_server()
    host, port = server.server_address
    print(f"Serving Anonymuse on http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
