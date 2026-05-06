export function getTime(milliseconds: number) {
  const minutes = Math.floor(milliseconds / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let output = "";

  if (days > 0) {
    output += `${days} d `;
  }
  if (hours > 0) {
    output += `${hours % 24} h `;
  }
  if (minutes > 0) {
    output += `${minutes % 60} m`;
  }

  if (output === "") {
    output = "0 m";
  }

  return output.trim();
}
