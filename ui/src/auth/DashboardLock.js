export function isDashboardUnlocked() {
  return localStorage.getItem("dashboardUnlocked") === "true";
}

export function unlockDashboard() {
  localStorage.setItem("dashboardUnlocked", "true");
}

export function lockDashboard() {
  localStorage.removeItem("dashboardUnlocked");
}
