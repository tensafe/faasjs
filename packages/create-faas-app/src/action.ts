import { Command } from 'commander'
import { prompt } from 'enquirer'
import {
  mkdirSync, writeFileSync, existsSync
} from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

const Validator = {
  name (input: string) {
    const match = /^[a-z0-9-_]+$/i.test(input) ? true : 'Must be a-z, 0-9 or -_'
    if (match !== true) return match
    if (existsSync(input)) return `${input} folder exists, please try another name`

    return true
  },
}

export async function action (options: {
  name?: string
  example?: boolean
} = {}): Promise<void> {
  const answers: {
    name?: string
    example?: boolean
  } = Object.assign(options, {})

  if (!options.name || Validator.name(options.name) !== true)
    answers.name = await prompt<{ value: string }>({
      type: 'input',
      name: 'value',
      message: 'Project name',
      validate: Validator.name
    }).then(res => res.value)

  if (typeof answers.example === 'undefined')
    answers.example = await prompt<{ value: boolean }>({
      type: 'confirm',
      name: 'value',
      message: 'Add example files',
      initial: true
    }).then(res => res.value)

  if (!answers.name) return

  mkdirSync(answers.name)

  writeFileSync(join(answers.name, 'faas.yaml'),
    `defaults:
  plugins:
development:
testing:
staging:
production:
`)

  writeFileSync(join(answers.name, 'package.json'),
    `{
  "name": "${answers.name}",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "serve": "faas server",
    "lint": "eslint --ext .ts .",
    "test": "jest"
  },
  "dependencies": {
    "faasjs": "beta",
    "@faasjs/eslint-config-recommended": "beta"
  },
  "eslintConfig": {
    "extends": [
      "@faasjs/recommended"
    ]
  },
  "eslintIgnore": [
    "tmp",
    "coverage"
  ],
  "jest": {
    "transform": {
      ".(jsx|tsx?)": "@faasjs/jest"
    },
    "collectCoverage": true,
    "collectCoverageFrom": [
      "**/*.ts"
    ],
    "testRegex": "/*\\\\.test\\\\.ts$",
    "modulePathIgnorePatterns": [
      "/tmp/",
      "/coverage/"
    ]
  }
}`)

  writeFileSync(join(answers.name, 'tsconfig.json'), `{
  "compilerOptions": {
    "downlevelIteration": true,
    "esModuleInterop": true,
    "target": "ES2019",
    "module": "ESNext",
    "moduleResolution": "node",
    "baseUrl": "."
  }
}
`)

  writeFileSync(join(answers.name, '.gitignore'), `node_modules/
tmp/
coverage/
*.tmp.js
`)

  mkdirSync(join(answers.name, '.vscode'))

  writeFileSync(join(answers.name, '.vscode', 'settings.json'),
    `{
  "editor.detectIndentation": true,
  "editor.insertSpaces": true,
  "editor.tabSize": 2,
  "editor.codeActionsOnSave": {
    "source.fixAll": true
  },
  "editor.wordWrap": "on",
  "files.insertFinalNewline": true,
  "files.trimFinalNewlines": true,
  "files.trimTrailingWhitespace": true,
  "eslint.packageManager": "npm"
}`)

  execSync(`cd ${answers.name} && npm install`, { stdio: 'inherit' })

  if (answers.example) {
    writeFileSync(join(answers.name, 'index.func.ts'),
      `import { useFunc } from '@faasjs/func';
import { useHttp } from '@faasjs/http';

export default useFunc(function () {
  useHttp();

  return async function () {
    return 'Hello, world';
  };
});
`)

    mkdirSync(join(answers.name, '__tests__'))
    writeFileSync(join(answers.name, '__tests__', 'index.test.ts'),
      `import { FuncWarper } from '@faasjs/test';

describe('hello', function () {
  test('should work', async function () {
    const func = new FuncWarper(require.resolve('../index.func'));

    const { data } = await func.JSONhandler<string>({});

    expect(data).toEqual('Hello, world');
  });
});
`)

    execSync(`cd ${answers.name} && npm exec jest`, { stdio: 'inherit' })
  }
}

export default function (program: Command): void {
  program
    .description('创建新项目')
    .on('--help', function () {
      console.log(`
Examples:
  npx create-faas-app`)
    })
    .option('--name <name>', '项目名字')
    .action(action)
}
