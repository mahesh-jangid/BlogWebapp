// Enhanced validation utilities for blog forms

export interface ValidationError {
  [key: string]: string;
}

export const VALIDATION_RULES = {
  title: {
    minLength: 3,
    maxLength: 200,
    pattern: /^[a-zA-Z0-9\s\-\'\".!?&,()]+$/,
  },
  content: {
    minLength: 50,
    maxLength: 50000,
  },
  excerpt: {
    maxLength: 500,
  },
  tags: {
    maxCount: 10,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-_]+$/,
  },
  featuredImage: {
    maxLength: 500,
  },
};

export const VALIDATION_MESSAGES = {
  title: {
    required: '📝 Title is required',
    minLength: `⚠️ Title must be at least ${VALIDATION_RULES.title.minLength} characters`,
    maxLength: `⚠️ Title cannot exceed ${VALIDATION_RULES.title.maxLength} characters`,
    pattern: '⚠️ Title contains invalid characters',
  },
  content: {
    required: '📝 Content is required',
    minLength: `⚠️ Content must be at least ${VALIDATION_RULES.content.minLength} characters`,
    maxLength: `⚠️ Content cannot exceed ${VALIDATION_RULES.content.maxLength} characters`,
  },
  excerpt: {
    maxLength: `⚠️ Excerpt cannot exceed ${VALIDATION_RULES.excerpt.maxLength} characters`,
  },
  tags: {
    maxCount: `⚠️ Maximum ${VALIDATION_RULES.tags.maxCount} tags allowed`,
    maxLength: `⚠️ Each tag cannot exceed ${VALIDATION_RULES.tags.maxLength} characters`,
    pattern: '⚠️ Tags can only contain letters, numbers, hyphens and underscores',
  },
  featuredImage: {
    invalidUrl: '🖼️ Please enter a valid image URL (http/https)',
    maxLength: `⚠️ URL cannot exceed ${VALIDATION_RULES.featuredImage.maxLength} characters`,
  },
};

/**
 * Validate blog title
 */
export const validateTitle = (title: string): string[] => {
  const errors: string[] = [];
  
  if (!title.trim()) {
    errors.push(VALIDATION_MESSAGES.title.required);
    return errors;
  }

  if (title.trim().length < VALIDATION_RULES.title.minLength) {
    errors.push(VALIDATION_MESSAGES.title.minLength);
  }

  if (title.length > VALIDATION_RULES.title.maxLength) {
    errors.push(VALIDATION_MESSAGES.title.maxLength);
  }

  if (!VALIDATION_RULES.title.pattern.test(title)) {
    errors.push(VALIDATION_MESSAGES.title.pattern);
  }

  return errors;
};

/**
 * Validate blog content
 */
export const validateContent = (content: string): string[] => {
  const errors: string[] = [];

  if (!content.trim()) {
    errors.push(VALIDATION_MESSAGES.content.required);
    return errors;
  }

  if (content.trim().length < VALIDATION_RULES.content.minLength) {
    errors.push(VALIDATION_MESSAGES.content.minLength);
  }

  if (content.length > VALIDATION_RULES.content.maxLength) {
    errors.push(VALIDATION_MESSAGES.content.maxLength);
  }

  return errors;
};

/**
 * Validate excerpt
 */
export const validateExcerpt = (excerpt: string): string[] => {
  const errors: string[] = [];

  if (excerpt && excerpt.length > VALIDATION_RULES.excerpt.maxLength) {
    errors.push(VALIDATION_MESSAGES.excerpt.maxLength);
  }

  return errors;
};

/**
 * Validate featured image URL
 */
export const validateFeaturedImage = (url: string): string[] => {
  const errors: string[] = [];

  if (!url) return errors; // Optional field

  if (url.length > VALIDATION_RULES.featuredImage.maxLength) {
    errors.push(VALIDATION_MESSAGES.featuredImage.maxLength);
    return errors;
  }

  // Check if it's a valid URL
  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      errors.push(VALIDATION_MESSAGES.featuredImage.invalidUrl);
    }
  } catch {
    errors.push(VALIDATION_MESSAGES.featuredImage.invalidUrl);
  }

  return errors;
};

/**
 * Validate tags
 */
export const validateTags = (tagsString: string): string[] => {
  const errors: string[] = [];

  if (!tagsString.trim()) return errors; // Optional field

  const tags = tagsString
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t);

  if (tags.length > VALIDATION_RULES.tags.maxCount) {
    errors.push(VALIDATION_MESSAGES.tags.maxCount);
  }

  for (const tag of tags) {
    if (tag.length > VALIDATION_RULES.tags.maxLength) {
      errors.push(VALIDATION_MESSAGES.tags.maxLength);
      break;
    }

    if (!VALIDATION_RULES.tags.pattern.test(tag)) {
      errors.push(VALIDATION_MESSAGES.tags.pattern);
      break;
    }
  }

  return errors;
};

/**
 * Comprehensive form validation
 */
export const validateBlogForm = (formData: {
  title: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  tags: string;
}): ValidationError => {
  const errors: ValidationError = {};

  // Validate title
  const titleErrors = validateTitle(formData.title);
  if (titleErrors.length > 0) {
    errors.title = titleErrors[0];
  }

  // Validate content
  const contentErrors = validateContent(formData.content);
  if (contentErrors.length > 0) {
    errors.content = contentErrors[0];
  }

  // Validate excerpt
  const excerptErrors = validateExcerpt(formData.excerpt);
  if (excerptErrors.length > 0) {
    errors.excerpt = excerptErrors[0];
  }

  // Validate featured image
  const imageErrors = validateFeaturedImage(formData.featuredImage);
  if (imageErrors.length > 0) {
    errors.featuredImage = imageErrors[0];
  }

  // Validate tags
  const tagErrors = validateTags(formData.tags);
  if (tagErrors.length > 0) {
    errors.tags = tagErrors[0];
  }

  return errors;
};

/**
 * Get progress percentage based on form fields
 */
export const getFormProgress = (formData: {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string;
}): number => {
  let completedFields = 0;
  const totalFields = 5;

  if (formData.title.trim()) completedFields++;
  if (formData.content.trim()) completedFields++;
  if (formData.excerpt.trim()) completedFields++;
  if (formData.category.trim()) completedFields++;
  if (formData.tags.trim()) completedFields++;

  return Math.round((completedFields / totalFields) * 100);
};

/**
 * Check if field has content (for real-time validation visual feedback)
 */
export const isFieldComplete = (field: string, value: string): boolean => {
  const rules = VALIDATION_RULES[field as keyof typeof VALIDATION_RULES];
  if (!rules) return value.trim().length > 0;

  const trimmed = value.trim();
  const minLength = 'minLength' in rules ? rules.minLength : 0;

  return trimmed.length >= minLength;
};
