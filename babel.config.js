module.exports = {
    presets: [
      '@babel/preset-env', // Para convertir código moderno de JavaScript en código compatible con versiones anteriores de Node.js.
    ],
    // Si estás utilizando módulos ESM (import/export)
    plugins: [
      '@babel/plugin-transform-runtime' // Para manejar correctamente async/await y otras características modernas.
    ],
};
