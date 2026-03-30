const collectCandidateValues = (
  input: unknown,
  keys: string[],
  seen = new Set<object>(),
  depth = 0,
): unknown[] => {
  if (!input || typeof input !== "object" || depth > 5) return [];
  if (seen.has(input)) return [];
  seen.add(input);

  const record = input as Record<string, unknown>;
  const results: unknown[] = [];

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      results.push(record[key]);
    }
  }

  for (const value of Object.values(record)) {
    if (value && typeof value === "object") {
      results.push(...collectCandidateValues(value, keys, seen, depth + 1));
    }
  }

  return results;
};

const findObjectWithAnyKey = (
  input: unknown,
  keys: string[],
  seen = new Set<object>(),
  depth = 0,
): Record<string, unknown> | null => {
  if (!input || typeof input !== "object" || depth > 5) return null;
  if (seen.has(input)) return null;
  seen.add(input);

  const record = input as Record<string, unknown>;
  if (keys.some((key) => Object.prototype.hasOwnProperty.call(record, key))) {
    return record;
  }

  for (const value of Object.values(record)) {
    if (value && typeof value === "object") {
      const match = findObjectWithAnyKey(value, keys, seen, depth + 1);
      if (match) return match;
    }
  }

  return null;
};

const extractDirectStringValue = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(record, key)) continue;
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
    if (typeof value === "number" || typeof value === "bigint") return String(value);
  }
  return "";
};

const extractDirectDisplayValue = (
  record: Record<string, unknown>,
  keys: string[],
) => {
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(record, key)) continue;
    const value = record[key];
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "bigint"
    ) {
      return typeof value === "string" ? value.trim() : String(value);
    }
  }
  return "";
};

export const extractStringValue = (body: unknown, keys: string[]) => {
  const candidates = collectCandidateValues(body, keys);
  const value = candidates.find(
    (candidate) => typeof candidate === "string" && candidate.trim().length > 0,
  );

  return typeof value === "string" ? value.trim() : "";
};

export const extractBooleanValue = (body: unknown, keys: string[]) => {
  const candidates = collectCandidateValues(body, keys);
  const value = candidates.find((candidate) => typeof candidate === "boolean");
  return typeof value === "boolean" ? value : undefined;
};

export const extractStringArrayValue = (body: unknown, keys: string[]) => {
  const candidates = collectCandidateValues(body, keys);
  const values = candidates.flatMap((candidate) => {
    if (!candidate) return [];
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is string => typeof item === "string");
    }
    if (typeof candidate === "string") {
      return [candidate];
    }
    return [];
  });

  return values.map((item) => item.trim()).filter(Boolean);
};

export const extractNullableStringValue = (body: unknown, keys: string[]) => {
  const value = extractStringValue(body, keys);
  return value.length > 0 ? value : "";
};

export const extractDisplayValue = (body: unknown, keys: string[]) => {
  const candidates = collectCandidateValues(body, keys);
  const value = candidates.find(
    (candidate) =>
      typeof candidate === "string" ||
      typeof candidate === "number" ||
      typeof candidate === "bigint",
  );

  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "bigint") return String(value);
  return "";
};

export const extractDateTimeValue = (body: unknown, keys: string[]) =>
  extractDisplayValue(body, keys);

export const extractAuthToken = (body: unknown) =>
  extractStringValue(body, ["token", "accessToken", "jwt", "authToken"]);

export const extractRefreshToken = (body: unknown) =>
  extractStringValue(body, ["refreshToken", "refresh_token"]);

export const extractUserId = (body: unknown) =>
  extractStringValue(body, [
    "userId",
    "id",
    "user_id",
    "accountId",
    "account_id",
  ]);

export const extractDisplayName = (body: unknown, fallbackEmail: string) =>
  extractStringValue(body, [
    "fullName",
    "name",
    "username",
    "displayName",
    "email",
  ]) || fallbackEmail;

export const extractProfileCompleted = (body: unknown) => {
  const direct = extractBooleanValue(body, ["profileCompleted"]);
  if (typeof direct === "boolean") return direct;

  const legacyFlag = extractBooleanValue(body, [
    "needsProfileCompletion",
    "requireProfileCompletion",
    "mustCompleteProfile",
    "firstLogin",
    "isFirstLogin",
  ]);

  return typeof legacyFlag === "boolean" ? !legacyFlag : undefined;
};

export type ClientProfileSnapshot = {
  userId: string;
  fullName: string;
  email: string;
  nationalId: string;
  gender: string;
  dob: string;
  phoneNumber: string;
  avatarUrl: string;
  address: string;
};

export type MyCustomerProfileSnapshot = {
  customerId: string;
  fullName: string;
  tripPoints: string;
  totalTrips: string;
  totalSpent: string;
  lastTripAt: string;
  lastBookingAt: string;
};

export type CustomerMembershipSnapshot = {
  id: string;
  customerId: string;
  membershipTierId: string;
  currentPoint: string;
  currentAvailablePoints: string;
  totalPoints: string;
  promotedAt: string;
  discountPercent: string;
  priorityLevel: string;
  status: string;
};

export type CustomerMembershipStatsSnapshot = {
  totalTrips: string;
  badge: string;
  totalSpent: string;
  pointToNextTier: string;
  pointMultiplier: string;
  nextTierName: string;
};

export type GetMyProfileSnapshot = ClientProfileSnapshot & {
  phone: string;
  status: string;
  emailVerified: boolean | null;
  phoneVerified: boolean | null;
  createdAt: string;
  updatedAt: string;
  authorities: string[];
  membership: CustomerMembershipSnapshot;
  stats: CustomerMembershipStatsSnapshot;
  customer: MyCustomerProfileSnapshot;
};

export const extractClientProfileSnapshot = (
  body: unknown,
): ClientProfileSnapshot => ({
  userId: extractUserId(body),
  fullName: extractStringValue(body, [
    "fullName",
    "name",
    "username",
    "displayName",
  ]),
  email: extractStringValue(body, ["email"]),
  nationalId: extractStringValue(body, [
    "nationalId",
    "nationalID",
    "cccdNumber",
    "idNumber",
    "identityNumber",
  ]),
  gender: extractStringValue(body, ["gender"]),
  dob: extractStringValue(body, ["dob", "dateOfBirth", "birthday"]),
  phoneNumber: extractStringValue(body, [
    "phoneNumber",
    "phone",
    "mobile",
    "mobileNumber",
  ]),
  avatarUrl: extractStringValue(body, [
    "avatarUrl",
    "avatar",
    "profileAvatarUrl",
    "imageUrl",
    "photoUrl",
  ]),
  address: extractStringValue(body, ["address"]),
});

export const extractMyProfileSnapshot = (
  body: unknown,
): GetMyProfileSnapshot => ({
  userId: extractStringValue(body, ["userId"]),
  fullName: extractStringValue(body, ["fullName", "name", "username", "displayName"]),
  email: extractStringValue(body, ["email"]),
  phone: extractStringValue(body, ["phone"]),
  status: extractStringValue(body, ["status"]),
  gender: extractStringValue(body, ["gender"]),
  avatarUrl: extractStringValue(body, ["avatarUrl"]),
  address: extractStringValue(body, ["address"]),
  nationalId: extractStringValue(body, ["nationalId"]),
  emailVerified: extractBooleanValue(body, ["emailVerified"]) ?? null,
  phoneVerified: extractBooleanValue(body, ["phoneVerified"]) ?? null,
  createdAt: extractDateTimeValue(body, ["createdAt"]),
  updatedAt: extractDateTimeValue(body, ["updatedAt"]),
  authorities: extractStringArrayValue(body, ["authorities"]),
  dob: extractDateTimeValue(body, ["dob", "dateOfBirth", "birthday"]),
  phoneNumber: extractStringValue(body, ["phone"]),
  membership: (() => {
    const membershipSource = findObjectWithAnyKey(body, [
      "currentPoint",
      "membershipTierId",
      "currentAvailablePoints",
      "totalPoints",
      "promotedAt",
      "discountPercent",
      "priorityLevel",
    ]);

    if (!membershipSource) {
      return {
        id: "",
        customerId: "",
        membershipTierId: "",
        currentPoint: "",
        currentAvailablePoints: "",
        totalPoints: "",
        promotedAt: "",
        discountPercent: "",
        priorityLevel: "",
        status: "",
      };
    }

    return {
      id: extractDirectStringValue(membershipSource, ["id"]),
      customerId: extractDirectStringValue(membershipSource, ["customerId"]),
      membershipTierId: extractDirectStringValue(membershipSource, [
        "membershipTierId",
      ]),
      currentPoint: extractDirectDisplayValue(membershipSource, ["currentPoint"]),
      currentAvailablePoints: extractDirectDisplayValue(membershipSource, [
        "currentAvailablePoints",
      ]),
      totalPoints: extractDirectDisplayValue(membershipSource, ["totalPoints"]),
      promotedAt: extractDirectDisplayValue(membershipSource, ["promotedAt"]),
      discountPercent: extractDirectDisplayValue(membershipSource, [
        "discountPercent",
      ]),
      priorityLevel: extractDirectDisplayValue(membershipSource, [
        "priorityLevel",
      ]),
      status: extractDirectStringValue(membershipSource, ["status"]),
    };
  })(),
  stats: (() => {
    const statsSource = findObjectWithAnyKey(body, [
      "badge",
      "pointToNextTier",
      "pointMultiplier",
      "nextTierName",
    ]);

    if (!statsSource) {
      return {
        totalTrips: "",
        badge: "",
        totalSpent: "",
        pointToNextTier: "",
        pointMultiplier: "",
        nextTierName: "",
      };
    }

    return {
      totalTrips: extractDirectDisplayValue(statsSource, ["totalTrips"]),
      badge: extractDirectStringValue(statsSource, ["badge"]),
      totalSpent: extractDirectDisplayValue(statsSource, ["totalSpent"]),
      pointToNextTier: extractDirectDisplayValue(statsSource, [
        "pointToNextTier",
      ]),
      pointMultiplier: extractDirectDisplayValue(statsSource, [
        "pointMultiplier",
      ]),
      nextTierName: extractDirectStringValue(statsSource, ["nextTierName"]),
    };
  })(),
  customer: {
    customerId: extractStringValue(body, ["customerId"]),
    fullName: extractStringValue(body, ["fullName", "name", "username", "displayName"]),
    tripPoints: extractDisplayValue(body, ["customer.tripPoints"]),
    totalTrips: extractDisplayValue(body, ["customer.totalTrips"]),
    totalSpent: extractDisplayValue(body, ["customer.totalSpent"]),
    lastTripAt: extractDateTimeValue(body, ["customer.lastTripAt"]),
    lastBookingAt: extractDateTimeValue(body, ["customer.lastBookingAt"]),
  },
});
