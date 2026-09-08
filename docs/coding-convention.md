# Coding Convention

코딩 에이전트가 파일을 생성할 때 예외 없이 적용해야 하는 네이밍 규칙이다. 규칙에 없는 형태(예: 접미사 누락, camelCase/PascalCase 혼용)로 파일명을 짓지 않는다.

## Naming Convention

| 분류             | 규칙                         | 예시                    |
| ---------------- | ---------------------------- | ----------------------- |
| 컴포넌트 파일    | PascalCase                   | `LoanTable.vue`         |
| 뷰 파일          | PascalCase + View 접미사     | `LoanListView.vue`      |
| 스토어 파일      | camelCase + Store 접미사     | `loanStore.js`          |
| API 파일         | camelCase + Api 접미사       | `loanApi.js`            |
| 라우트 파일      | camelCase + .routes 접미사   | `loan.routes.js`        |
| composable       | use 접두사 + PascalCase      | `useLoan.js`            |
| MSW 핸들러       | camelCase + Handlers 접미사  | `loanHandlers.js`       |

전체 폴더 구조와 의존성 규칙은 [architecture.md](./architecture.md)를 참고하세요.
