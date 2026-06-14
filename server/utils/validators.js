import mongoose from "mongoose";

const COURSE_LEVELS = ["Beginner", "Medium", "Advance"];
const QUIZ_TYPES = ["multiple_choice", "true_false", "short_answer"];

export const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const validateObjectIdField = (field, value, errors) => {
  if (!value || !isValidObjectId(value)) {
    errors.push(`${field} must be a valid id`);
  }
};

export const validateStringField = (field, value, errors, { required = false } = {}) => {
  if (value === undefined || value === null || value === "") {
    if (required) {
      errors.push(`${field} is required`);
    }
    return;
  }

  if (typeof value !== "string") {
    errors.push(`${field} must be a string`);
    return;
  }

  if (!value.trim()) {
    errors.push(`${field} cannot be empty`);
  }
};

export const validateNumberField = (field, value, errors, { min, max, integer = false } = {}) => {
  if (value === undefined || value === null || value === "") {
    return;
  }

  if (typeof value !== "number" || Number.isNaN(value)) {
    errors.push(`${field} must be a number`);
    return;
  }

  if (integer && !Number.isInteger(value)) {
    errors.push(`${field} must be an integer`);
  }

  if (min !== undefined && value < min) {
    errors.push(`${field} must be greater than or equal to ${min}`);
  }

  if (max !== undefined && value > max) {
    errors.push(`${field} must be less than or equal to ${max}`);
  }
};

export const validateBooleanField = (field, value, errors) => {
  if (value === undefined) {
    return;
  }

  if (typeof value !== "boolean") {
    errors.push(`${field} must be a boolean`);
  }
};

export const validateSupportMaterials = (materials, errors) => {
  if (materials === undefined) {
    return;
  }

  if (!Array.isArray(materials)) {
    errors.push("supportMaterials must be an array");
    return;
  }

  materials.forEach((material, index) => {
    if (!material || typeof material !== "object") {
      errors.push(`supportMaterials[${index}] must be an object`);
      return;
    }

    validateStringField(`supportMaterials[${index}].name`, material.name, errors, { required: true });
    validateStringField(`supportMaterials[${index}].url`, material.url, errors, { required: true });

    if (material.s3Key !== undefined) {
      validateStringField(`supportMaterials[${index}].s3Key`, material.s3Key, errors);
    }

    if (material.key !== undefined) {
      validateStringField(`supportMaterials[${index}].key`, material.key, errors);
    }
  });
};

export const validateCoursePayload = (payload, { partial = false } = {}) => {
  const errors = [];
  validateStringField("courseTitle", payload.courseTitle, errors, { required: !partial });
  validateStringField("category", payload.category, errors, { required: !partial });
  validateStringField("subTitle", payload.subTitle, errors);
  validateStringField("description", payload.description, errors);

  if (payload.courseLevel !== undefined && !COURSE_LEVELS.includes(payload.courseLevel)) {
    errors.push(`courseLevel must be one of: ${COURSE_LEVELS.join(", ")}`);
  }

  if (payload.coursePrice !== undefined && payload.coursePrice !== null && payload.coursePrice !== "") {
    const numericPrice = Number(payload.coursePrice);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      errors.push("coursePrice must be a non-negative number");
    }
  }

  if (
    payload.flowPricingEnabled !== undefined &&
    ![true, false, "true", "false", ""].includes(payload.flowPricingEnabled)
  ) {
    errors.push("flowPricingEnabled must be a boolean");
  }

  if (payload.flowPricingPrice !== undefined && payload.flowPricingPrice !== null && payload.flowPricingPrice !== "") {
    const numericFlowPrice = Number(payload.flowPricingPrice);
    if (Number.isNaN(numericFlowPrice) || numericFlowPrice < 0) {
      errors.push("flowPricingPrice must be a non-negative number");
    }
  }

  if (payload.flowPricingCurrency !== undefined && payload.flowPricingCurrency !== null && payload.flowPricingCurrency !== "") {
    if (typeof payload.flowPricingCurrency !== "string" || !payload.flowPricingCurrency.trim()) {
      errors.push("flowPricingCurrency must be a non-empty string");
    }
  }

  return errors;
};

export const validateLecturePayload = (payload, { partial = false } = {}) => {
  const errors = [];
  validateStringField("lectureTitle", payload.lectureTitle, errors, { required: !partial });
  validateStringField("lectureDescription", payload.lectureDescription, errors);
  validateSupportMaterials(payload.supportMaterials, errors);
  validateBooleanField("isPreviewFree", payload.isPreviewFree, errors);

  if (payload.lectureOrder !== undefined) {
    validateNumberField("lectureOrder", payload.lectureOrder, errors, { min: 1, integer: true });
  }

  if (payload.videoInfo !== undefined) {
    if (!payload.videoInfo || typeof payload.videoInfo !== "object") {
      errors.push("videoInfo must be an object");
    } else {
      validateStringField("videoInfo.videoUrl", payload.videoInfo.videoUrl, errors);
      validateStringField("videoInfo.s3Key", payload.videoInfo.s3Key, errors);
      validateStringField("videoInfo.publicId", payload.videoInfo.publicId, errors);
    }
  }

  return errors;
};

export const validateQuizPayload = (payload, { requireLectureId = true } = {}) => {
  const errors = [];

  if (requireLectureId) {
    validateObjectIdField("lectureId", payload.lectureId, errors);
  }

  validateStringField("title", payload.title, errors, { required: true });
  validateStringField("description", payload.description, errors);
  validateNumberField("timeLimit", payload.timeLimit, errors, { min: 0, integer: true });
  validateNumberField("passingScore", payload.passingScore, errors, { min: 0, max: 100, integer: true });
  validateNumberField("maxAttempts", payload.maxAttempts, errors, { min: 1, integer: true });

  if (!Array.isArray(payload.questions) || payload.questions.length === 0) {
    errors.push("questions must be a non-empty array");
    return errors;
  }

  payload.questions.forEach((question, questionIndex) => {
    if (!question || typeof question !== "object") {
      errors.push(`questions[${questionIndex}] must be an object`);
      return;
    }

    validateStringField(`questions[${questionIndex}].question`, question.question, errors, { required: true });
    validateNumberField(`questions[${questionIndex}].points`, question.points, errors, { min: 0, integer: true });
    validateStringField(`questions[${questionIndex}].explanation`, question.explanation, errors);

    if (!QUIZ_TYPES.includes(question.type)) {
      errors.push(`questions[${questionIndex}].type must be one of: ${QUIZ_TYPES.join(", ")}`);
      return;
    }

    if (question.type === "short_answer") {
      validateStringField(`questions[${questionIndex}].correctAnswer`, question.correctAnswer, errors, { required: true });
      return;
    }

    if (!Array.isArray(question.options) || question.options.length < 2) {
      errors.push(`questions[${questionIndex}].options must contain at least two options`);
      return;
    }

    let correctCount = 0;
    question.options.forEach((option, optionIndex) => {
      if (!option || typeof option !== "object") {
        errors.push(`questions[${questionIndex}].options[${optionIndex}] must be an object`);
        return;
      }

      validateStringField(`questions[${questionIndex}].options[${optionIndex}].text`, option.text, errors, { required: true });
      if (typeof option.isCorrect !== "boolean") {
        errors.push(`questions[${questionIndex}].options[${optionIndex}].isCorrect must be a boolean`);
      }
      if (option.isCorrect) {
        correctCount += 1;
      }
    });

    if (question.type === "true_false" && question.options.length !== 2) {
      errors.push(`questions[${questionIndex}].options must contain exactly two options for true_false questions`);
    }

    if (correctCount === 0) {
      errors.push(`questions[${questionIndex}] must have at least one correct option`);
    }
  });

  return errors;
};