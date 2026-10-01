// Slot makinesi ortak zamanlaması:
// şeritleri ItemSelector çizer, CharacterEditor şerit uzunluğunu kurar.
// Easing: easeInOutCubic — kalkış görünür, orta kısım hızlı (blur), oturüş yumuşak.
export const TILE_SPIN_CELLS = [14, 18, 22];
export const TILE_SPIN_DURATION = [900, 1150, 1400];
export const SPIN_START_DELAY = 150;
export const REVEAL_BEAT = 150;
// anime takılırsa (gizli/arka plan sekme, rAF kısıtlı) commit'i garanti eder;
// normal akışta `complete` bu timer'dan önce gelir.
export const SETTLE_BUFFER = 1200;
