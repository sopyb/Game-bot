function convertXp(xp) {
    let level = 0, xpRequired = (level-1)**3+5*(level**2)+25*level+101;

    if (!xp) xp = 0

    for (xpRequired; xpRequired < xp; xpRequired = (level-1)**3+5*(level**2)+25*level+101) {
        level++
        xp -= xpRequired
    }

    return {
        level,
        xp,
        xpRequired
    }
}

module.exports = {
    convertXp
}