module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [2, 'always', ['feat', 'chore', 'fix', 'docs', 'style', 'refactor', 'ci', 'test']],
        'type-case': [2, 'always', ['lower-case']],
        'scope-case': [2, 'always', ['sentence-case', 'camel-case']],
        'subject-case': [0, 'always', ['lower-case']]
    }
};
