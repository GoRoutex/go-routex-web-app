const originalFetch = window.fetch;

window.fetch = async function (input, init) {
  const initConfig = init || {};

  // Automatically include session cookies for all api requests
  initConfig.credentials = initConfig.credentials || "include";

  // Check if request is targeting our API Gateway
  const isApiRequest = typeof input === "string" && (input.includes("/api/v1/") || input.includes("localhost:8080"));

  if (isApiRequest) {
    const headers = initConfig.headers || {};

    if (headers instanceof Headers) {
      headers.set("X-Client-Type", "Web");
    } else if (Array.isArray(headers)) {
      if (!headers.some(([k]) => k.toLowerCase() === "x-client-type")) {
        headers.push(["X-Client-Type", "Web"]);
      }
    } else {
      (headers as Record<string, string>)["X-Client-Type"] = "Web";
    }

    initConfig.headers = headers;
  }

  const response = await originalFetch.call(this, input, initConfig);

  // If we receive a 401 Unauthorized from any API request (excluding login)
  if (isApiRequest && response.status === 401) {
    const urlString = typeof input === "string" ? input : "";
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    
    if (!urlString.includes("/authentication/login") && isLoggedIn) {
      console.warn("Unauthorized API call detected, clearing local storage and redirecting to login...");
      
      const keysToRemove = [
        "isLoggedIn", "authToken", "refreshToken", "userRoles:v1", "userRoles", "userRole", 
        "userName", "userEmail", "userId", "userPhoneNumber",
        "profileCompleted", "profileFullName", "profileNationalId", "profileCccdNumber",
        "profileDob", "profileAvatarUrl", "profileAddress", "profileGender",
        "profilePhone", "profileStatus", "profileEmailVerified", "profilePhoneVerified",
        "profileCreatedAt", "profileUpdatedAt", "profileAuthorities:v1", "profileAuthorities", "profileRole",
        "profileCustomerId", "profileTripPoints", "profileTotalTrips", "profileTotalSpent",
        "profileLastTripAt", "profileLastBookingAt",
        "membershipId", "membershipCustomerId", "membershipTierId", "membershipCurrentPoint",
        "membershipCurrentAvailablePoints", "membershipTotalPoints", "membershipPromotedAt",
        "membershipDiscountPercent", "membershipPriorityLevel", "membershipStatus",
        "membershipStatsTotalTrips", "membershipBadge", "membershipStatsTotalSpent",
        "membershipPointToNextTier", "membershipPointMultiplier", "membershipNextTierName",
        "customerId", "merchantId"
      ];
      keysToRemove.forEach(key => localStorage.removeItem(key));
      window.location.href = "/";
    }
  }

  return response;
};
