export function variantByColor(name) {
    const variants = {
        c: 'cyan',
        m: 'magenta',
        y: 'yellow',
        k: 'black',
        r: 'red',
        g: 'green',
        b: 'blue',
    };

    return variants[name];
}