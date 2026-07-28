/**
 * ApiResponseType Constants
 * Preserves the exact status codes from legacy Laravel (App\Constants\ApiResponseType).
 * Sent in the `status` field of JSON responses for mobile application endpoints.
 */
const ApiResponseType = Object.freeze({
  MODEL_NOT_FOUND:            404,
  INVALID_CREDENTIAL:         417,
  APPROVAL_NEEDED:            407,
  SUCCESS:                    200,
  VALIDATION_ERROR:           429,

  ALREADY_EXISTS:             409,
  INVALID_OFFICE:             412,
  INVALID_DEVICE:             456,
  LATE_ATTENDANCE:            466,
  INVALID_GEO:                444,
  ALREADY_SIGNIN:             441,
  DUPLICATE_ATTENDANCE:       451,
  DUPLICATE_APPEAL_ATTENDANCE:409
});

module.exports = ApiResponseType;
