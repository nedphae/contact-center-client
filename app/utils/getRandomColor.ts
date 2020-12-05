import randomColor from 'randomcolor';

/**
 * 获取随机颜色, 刷新页面不变
 * @param seed when passed will cause randomColor to return the same color each time
 */
export function getRandomColor(seed: string, luminosity = 'dark') {
    // @ts-ignore
    return randomColor({
        luminosity,
        seed,
    });
}

const cache = {};
/**
 * 获取随机颜色, 刷新页面后重新随机
 * @param seed 随机种子
 * @param luminosity 亮度
 */
export function getPerRandomColor(seed: string, luminosity = 'dark') {
    // @ts-ignore
    if (cache[seed]) {
        // @ts-ignore
        return cache[seed];
    }
    // @ts-ignore
    cache[seed] = randomColor({ luminosity });
    // @ts-ignore
    return cache[seed];
}
