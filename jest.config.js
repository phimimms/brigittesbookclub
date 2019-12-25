
module.exports = {
  cacheDirectory: 'test/cache',
  collectCoverage: true,
  collectCoverageFrom: [ 'src/app/**/*.ts', 'src/server/**/*.ts' ],
  coverageDirectory: 'test/coverage',
  moduleDirectories: [ 'src/app', 'src/server', 'node_modules' ],
  moduleFileExtensions: [ 'ts', 'mjs', 'svelte', 'js', 'json' ],
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'test/mocks/file.js',
  },
  preset: 'ts-jest',
  roots: [ 'src/app', 'src/server' ],
};
