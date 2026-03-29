DROP TABLE IF EXISTS comment_interactions;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (email, password, role, is_active) VALUES
('admin@test.com', 'Admin123!', 'admin', TRUE),
('user@test.com', 'User123!', 'user', TRUE);

CREATE TABLE posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(120) NOT NULL,
  content TEXT NOT NULL,
  format VARCHAR(60) NOT NULL DEFAULT 'One-minute reflection',
  why_matters TEXT NULL,
  hoped_conversation TEXT NULL,
  category VARCHAR(80) NOT NULL DEFAULT 'General',
  sensitivity VARCHAR(20) NOT NULL DEFAULT 'medium',
  declaration_accepted BOOLEAN NOT NULL DEFAULT TRUE,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  parent_post_id INT NULL,
  source_comment_id INT NULL,
  promoted_by INT NULL,
  promoted_at TIMESTAMP NULL,
  approved_by INT NULL,
  rejected_by INT NULL,
  revision_requested_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL,
  rejected_at TIMESTAMP NULL,
  revision_requested_at TIMESTAMP NULL,
  CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_posts_parent FOREIGN KEY (parent_post_id) REFERENCES posts(id),
  CONSTRAINT fk_posts_promoted_by FOREIGN KEY (promoted_by) REFERENCES users(id),
  CONSTRAINT fk_posts_approved_by FOREIGN KEY (approved_by) REFERENCES users(id),
  CONSTRAINT fk_posts_rejected_by FOREIGN KEY (rejected_by) REFERENCES users(id),
  CONSTRAINT fk_posts_revision_by FOREIGN KEY (revision_requested_by) REFERENCES users(id)
);

INSERT INTO posts (
  user_id, title, content, format, why_matters, hoped_conversation, category, sensitivity,
  declaration_accepted, status, parent_post_id, source_comment_id, promoted_by, promoted_at,
  approved_by, rejected_by, revision_requested_by, approved_at, rejected_at, revision_requested_at
) VALUES
(
  2,
  'What does silence protect in a group conversation?',
  'In this week''s reflection, we notice how silence can be both refuge and avoidance.',
  'One-minute audio reflection',
  'Silence can protect both humility and fear. Naming this helps community discernment.',
  'How do we distinguish reflective silence from avoidance in church culture?',
  'Church culture',
  'medium',
  TRUE,
  'approved',
  NULL,
  NULL,
  NULL,
  NULL,
  1,
  NULL,
  NULL,
  CURRENT_TIMESTAMP,
  NULL,
  NULL
),
(
  2,
  'Feature idea',
  'Could we add a bookmarks section for saved content?',
  'One-minute video reflection',
  'People may want to revisit thoughtful reflections.',
  'How can revisit features support deeper reflection over time?',
  'Platform',
  'low',
  TRUE,
  'pending',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL
);

CREATE TABLE comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  parent_comment_id INT NULL,
  response_type ENUM('resonates', 'pushes_back', 'worth_discussing', 'reply') NOT NULL DEFAULT 'resonates',
  status ENUM('active', 'removed') NOT NULL DEFAULT 'active',
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(id),
  CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_comments_parent FOREIGN KEY (parent_comment_id) REFERENCES comments(id)
);

INSERT INTO comments (post_id, user_id, parent_comment_id, response_type, status, content) VALUES
(1, 2, NULL, 'resonates', 'active', 'Glad this one made it into the feed.');

CREATE TABLE comment_interactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  comment_id INT NOT NULL,
  user_id INT NOT NULL,
  interaction_type ENUM('like', 'resonate', 'discuss', 'flag') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comment_interactions_comment FOREIGN KEY (comment_id) REFERENCES comments(id),
  CONSTRAINT fk_comment_interactions_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT uq_comment_user_action UNIQUE (comment_id, user_id, interaction_type)
);

INSERT INTO comment_interactions (comment_id, user_id, interaction_type) VALUES
(1, 2, 'like'),
(1, 2, 'resonate'),
(1, 2, 'discuss');
