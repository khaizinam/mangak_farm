// ============================================================
// GAME CONSTANTS
// ============================================================

const SEASON_SPRING = 'spring';
const SEASON_SUMMER = 'summer';
const SEASON_AUTUMN = 'autumn';
const SEASON_WINTER = 'winter';

const SEASON = {
  SPRING: SEASON_SPRING,
  SUMMER: SEASON_SUMMER,
  AUTUMN: SEASON_AUTUMN,
  WINTER: SEASON_WINTER
};

const SEASONS = [SEASON_SPRING, SEASON_SUMMER, SEASON_AUTUMN, SEASON_WINTER];

const SEASON_LABELS = {
  [SEASON_SPRING]: '🌸 Xuân',
  [SEASON_SUMMER]: '☀️ Hạ',
  [SEASON_AUTUMN]: '🍂 Thu',
  [SEASON_WINTER]: '❄️ Đông'
};

// Expose globally
window.SEASON_SPRING = SEASON_SPRING;
window.SEASON_SUMMER = SEASON_SUMMER;
window.SEASON_AUTUMN = SEASON_AUTUMN;
window.SEASON_WINTER = SEASON_WINTER;
window.SEASON = SEASON;
window.SEASONS = SEASONS;
window.SEASON_LABELS = SEASON_LABELS;
