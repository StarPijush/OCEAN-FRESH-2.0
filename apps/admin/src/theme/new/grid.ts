// OceanFresh Admin — Reference-aligned grid tokens

export const grid = {
  // Container max widths
  containerSm: 640,
  containerMd: 768,
  containerLg: 1024,
  containerXl: 1280,
  container2xl: 1440,

  // Sidebar
  sidebarWidth: 220,
  sidebarWidthCollapsed: 72,

  // Header heights
  headerHeightMobile: 56,
  headerHeightDesktop: 64,

  // Gutter / spacing
  gutter: 16,
  gutterSm: 12,
  gutterLg: 24,

  // Content padding
  contentPaddingMobile: 16,
  contentPaddingTablet: 20,
  contentPaddingDesktop: 24,

  // Card grid
  cardGap: 12,
  cardMinWidth: 280,
  cardMaxWidth: 400,

  // Modal / Sheet
  modalMaxWidth: 560,
  modalMaxWidthSm: 440,
  modalMaxWidthLg: 720,

  // Form
  formFieldGap: 12,
  formSectionGap: 20,
  formGroupGap: 16,

  // Chart
  chartHeightMobile: 200,
  chartHeightTablet: 220,
  chartHeightDesktop: 240,
  chartBarGap: 6,

  // Z-index layers
  zBase: 0,
  zDropdown: 100,
  zSticky: 200,
  zModal: 300,
  zDrawer: 400,
  zDrawerOverlay: 350,
  zToast: 500,
  zTooltip: 600,
} as const;

export type GridToken = keyof typeof grid;
