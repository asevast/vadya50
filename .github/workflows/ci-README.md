Этот workflow запускает:
- линт (`npm run lint`)
- проверку типов (`npm run type-check`)
- unit-тесты (`npm run test`)
- e2e Playwright (`npx playwright test`)

Если e2e не нужен в каких-то ветках, можно ограничить запуск по нужным условиям.
