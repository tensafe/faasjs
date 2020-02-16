module.exports = {
  preset: 'ts-jest',
  verbose: true,
  collectCoverage: true,
  testRegex: '/*\\.test\\.ts$',
  testPathIgnorePatterns: [
    '/lib/',
    '/tmp/'
  ],
  coveragePathIgnorePatterns: [
    '/lib/',
    '/tmp/',
    '/__tests__/'
  ],
  moduleNameMapper: {
    '@faasjs/(.*)': '<rootDir>/./packages/$1/src'
  },
  setupFiles: [
    __dirname + '/jest.setup.js'
  ]
};
