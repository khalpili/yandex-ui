/* eslint-disable react-hooks/rules-of-hooks */
const { resolve } = require('path');
const { useCleanUpPlugin } = require('@bem-react/pack/lib/plugins/CleanUpPlugin');
const { useCopyAssetsPlugin } = require('@bem-react/pack/lib/plugins/CopyAssetsPlugin');
const { useCssPlugin } = require('@bem-react/pack/lib/plugins/CssPlugin');
const { useTypeScriptPlugin } = require('@bem-react/pack/lib/plugins/TypeScriptPlugin');

/**
 * @type {import('@bem-react/pack/lib/interfaces').Config}
 */
module.exports = {
    context: resolve(__dirname, '..'),

    output: './dist',

    plugins: [
        useCleanUpPlugin(['./dist']),

        // Плагин также создает esm версию сборки
        // и добавляет package.json для каждого компонента.
        useTypeScriptPlugin({
            configPath: './tsconfig.prod.json',
            onCreateSideEffects(path) {
                if (path.includes('pointerfocus/index.js')) {
                    return ['*.js'];
                }
            },
        }),

        useCssPlugin({
            context: './src',
            src: './**/*.css',
            // Дополнительно собираем css для esm сборки.
            output: ['./dist', './dist/esm'],
            ignore: ['**/*.tests/**', '**/internal/**'],
        }),

        useCopyAssetsPlugin([
            {
                context: './src',
                src: './**/*.{svg,png,md,json,yml}',
                // Дополнительно копируем статику для esm сборки.
                output: ['./dist', './dist/esm'],
                ignore: ['**/*.tests/**', '**/internal/**'],
            },
            {
                src: ['./package.json', './README.md'],
            },
            {
                src: './codeshifts/**/*',
                ignore: ['**/*.test*', '**/fixtures/**'],
            },
        ]),

        {
            // TODO(https://github.com/yarastqt/themekit/issues/81)
            // Удалить после того, как будут поддержаны относительные пути в темах.
            onFinish(done, context) {
                const fs = require('fs');
                const path = require('path');
                const themesDir = path.join(context.output, 'Theme/themes');
                const themes = fs.readdirSync(themesDir);
                themes.forEach((theme) => {
                    const themePath = path.join(themesDir, theme);
                    const content = fs.readFileSync(themePath, 'utf-8').replace(/.\/src/g, '.');
                    fs.writeFileSync(themePath, content);
                });
                // названия компонентов достаем из директории
                // если папка начинается с большой буквы, значит компонент
                const componentsNames = fs.readdirSync(context.output, { withFileTypes: true })
                    .filter((dir) => dir.isDirectory() && /^[A-Z]/.test(dir.name))
                    .map((dir) => ({ block: dir.name }));

                const componentsJSONPath = path.join(context.output, 'components.json');
                fs.writeFileSync(componentsJSONPath, JSON.stringify(componentsNames, null, 2));

                /**
                 * Во время публикациюю делается npm pack ./publishConfig.directory
                 * Из-за чего внутри dist запускаются lifecycle npm скрипты: создается еще одна папка dist, etc.
                 * В dist уже всё собрано, поэтому вычищаю scripts, чтобы внутри dist ничего не запускалось.
                 */
                const packageJsonPath = path.join(context.output, 'package.json');
                const packageJson = require(packageJsonPath);
                packageJson.scripts = {};
                fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

                done();
            },
        },
    ],
};
