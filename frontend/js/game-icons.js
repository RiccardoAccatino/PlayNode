/**
 * Icone gioco condivise in tutta l'app.
 */
export function iconaGioco(nome) {
    const n = String(nome || '').toLowerCase();

    if (n.includes('calciobalilla') || n.includes('biliardino') || n.includes('calcio'))
        return '⚽';
    if (n.includes('bocce') || n.includes('boccia'))
        return '🎳';
    if (n.includes('frecc') || n.includes('dardo'))
        return '🎯';
    if (n.includes('bowling'))
        return '🎳';
    if (n.includes('ping') || n.includes('tennis'))
        return '🏓';
    if (n.includes('basket'))
        return '🏀';
    if (n.includes('biliard'))
        return '🎱';

    return '🎮';
}

/**
 * Colori gioco condivisi in tutta l'app.
 */
export function coloreGioco(nome) {
    if (!nome)
        return null;
    const k = String(nome).trim().toLowerCase();

    const explicit = {
        'calciobalilla smart': 'var(--neon-blue, #3b82f6)',
        'calciobalilla': 'var(--neon-blue, #3b82f6)',
        'calcio balilla': 'var(--neon-blue, #3b82f6)',
        'calcio balilla smart': 'var(--neon-blue, #3b82f6)',
        'bocce elettroniche': 'var(--neon-red, #ef4444)',
        'bocce': 'var(--neon-red, #ef4444)',
        'biliardo': 'var(--neon-amber, #f59e0b)',
        'biliardo classic': 'var(--neon-amber, #f59e0b)',
        'ping pong': 'var(--neon-pink, #ec4899)',
        'air hockey': 'var(--neon-green, #10b981)'
    };

    if (explicit[k])
        return explicit[k];

    // Fallback a regole di match parziale
    if (k.includes('calci') || k.includes('calcio') || k.includes('futbol') || k.includes('football'))
        return 'var(--neon-blue, #3b82f6)';
    if (k.includes('bocc'))
        return 'var(--neon-red, #ef4444)';
    if (k.includes('biliard') || k.includes('billiard'))
        return 'var(--neon-amber, #f59e0b)';
    if (k.includes('ping') || k.includes('pong'))
        return 'var(--neon-pink, #ec4899)';
    if (k.includes('air') || k.includes('arcade'))
        return 'var(--neon-green, #10b981)';

    return null;
}
