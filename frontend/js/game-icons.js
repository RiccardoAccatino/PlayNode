/**
 * Icone gioco condivise in tutta l'app (emoji coerenti con ui-locale).
 * Bocce: sfera da lancio (🎳), non bersaglio freccette (🎯).
 */
export function iconaGioco(nome) {
    const n = String(nome || '').toLowerCase();

    if (n.includes('calciobalilla') || n.includes('biliardino') || n.includes('calcio')) return '⚽';
    if (n.includes('bocce') || n.includes('boccia')) return '🎳';
    if (n.includes('frecc') || n.includes('dardo')) return '🎯';
    if (n.includes('bowling')) return '🎳';
    if (n.includes('ping') || n.includes('tennis')) return '🏓';
    if (n.includes('basket')) return '🏀';
    if (n.includes('biliard')) return '🎱';

    return '🎮';
}
