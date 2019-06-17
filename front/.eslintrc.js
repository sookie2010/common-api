module.exports = {
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
      modules: true,
      experimentalObjectRestSpread: true,
      objectLiteralComputedProperties: false
    }
  },
  rules: {
    // "vue/no-parsing-error": [2, { "x-invalid-end-tag": false }]
  }
}