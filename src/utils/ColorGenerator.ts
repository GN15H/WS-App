
const USER_COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#FFA07A", // Light Salmon
  "#98D8C8", // Mint
  "#F7DC6F", // Yellow
  "#BB8FCE", // Purple
  "#85C1E2", // Sky Blue
  "#F8B88B", // Peach
  "#AED6F1", // Pale Blue
  "#F5B7B1", // Light Red
  "#D7BDE2", // Lavender
  "#A9DFBF", // Light Green
  "#F9E79F", // Light Yellow
  "#FADBD8", // Misty Rose
]

/**
 * Generates a consistent unique color for a user based on their ID
 * The same user ID will always get the same color within a room
 * @param userId - The unique identifier of the user
 * @returns A hex color code
 */
export const getUserColor = (userId: number): string => {
  const colorIndex = userId % USER_COLORS.length
  return USER_COLORS[colorIndex]
}

/**
 * Get a contrasting text color (white or black) based on background color brightness
 * @param hexColor - The hex color to check
 * @returns Either white or black for optimal contrast
 */
export const getContrastColor = (hexColor: string): string => {
  const hex = hexColor.replace("#", "")
  const r = Number.parseInt(hex.substring(0, 2), 16)
  const g = Number.parseInt(hex.substring(2, 4), 16)
  const b = Number.parseInt(hex.substring(4, 6), 16)

  const brightness = (r * 299 + g * 587 + b * 114) / 1000

  return brightness > 128 ? "#000000" : "#FFFFFF"
}
