export const PALETTES = {
  sems: { 
    name: 'Şems (Obsidyen & Altın)',
    primary: '#D4AF37',       // Luxury Gold
    primaryDark: '#B8860B',
    secondary: '#FBBF24',
    background: '#09090B',    // True Black / Zinc 950
    surface: '#18181B',       // Zinc 900
    text: '#FAFAFA',
    textSecondary: '#A1A1AA',
    border: '#27272A',
    isDark: true,
  },
  bogazici: { 
    name: 'Boğaziçi Laciverti',
    primary: '#38BDF8',       
    primaryDark: '#0284C7',
    secondary: '#7DD3FC',
    background: '#020617',    // Slate 950
    surface: '#0F172A',       // Slate 900
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    border: '#1E293B',
    isDark: true,
  },
  kapadokya: { 
    name: 'Kapadokya Toprağı',
    primary: '#F97316',       
    primaryDark: '#C2410C',
    secondary: '#FDBA74',
    background: '#0A0A0A',    // Neutral 950
    surface: '#171717',       // Neutral 900
    text: '#FAFAFA',
    textSecondary: '#A3A3A3',
    border: '#262626',
    isDark: true,
  },
  cini: { 
    name: 'Selçuklu Çinisi',
    primary: '#0D9488',       
    primaryDark: '#0F766E',
    secondary: '#5EEAD4',
    background: '#FFFFFF',    // White
    surface: '#F8FAFC',       // Slate 50
    text: '#020617',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    isDark: false,
  },
  yakut: { 
    name: 'Osmanlı Yakutu',
    primary: '#E11D48',       
    primaryDark: '#BE123C',
    secondary: '#FDA4AF',
    background: '#09090B',    // Zinc 950
    surface: '#18181B',
    text: '#FAFAFA',
    textSecondary: '#A1A1AA',
    border: '#27272A',
    isDark: true,
  },
  uludag: { 
    name: 'Uludağ Zirvesi',
    primary: '#0284C7',       
    primaryDark: '#0369A1',
    secondary: '#38BDF8',
    background: '#FFFFFF',
    surface: '#F1F5F9',       // Slate 100
    text: '#0F172A',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    isDark: false,
  },
  zumrut: { 
    name: 'Hürrem Zümrüdü',
    primary: '#10B981',       
    primaryDark: '#047857',
    secondary: '#6EE7B7',
    background: '#050505',    // Pure dark
    surface: '#141414',
    text: '#FAFAFA',
    textSecondary: '#A3A3A3',
    border: '#262626',
    isDark: true,
  },
  erguvan: { 
    name: 'İstanbul Erguvanı',
    primary: '#C084FC',       
    primaryDark: '#9333EA',
    secondary: '#D8B4FE',
    background: '#09090B',    
    surface: '#18181B',
    text: '#FAFAFA',
    textSecondary: '#A1A1AA',
    border: '#27272A',
    isDark: true,
  },
  lalezar: { 
    name: 'Lalezar',
    primary: '#E11D48',       
    primaryDark: '#BE123C',
    secondary: '#FDA4AF',
    background: '#FAFAFA',    // Very clean white base
    surface: '#FFF1F2',       // Extremely subtle rose surface
    text: '#09090B',          // Dark text, not colored
    textSecondary: '#52525B', 
    border: '#FFE4E6',
    isDark: false,
  },
  pamukkale: { 
    name: 'Pamukkale Traverteni',
    primary: '#14B8A6',
    primaryDark: '#0D9488',
    secondary: '#5EEAD4',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    isDark: false,
  }
};

export const COLORS = PALETTES.sems; 

export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONTS = {
  regular: 'System',
  bold: 'System',
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
};
