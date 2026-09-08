# 개발 워크플로 (에이전트용)

Claude Code 등 코딩 에이전트가 이 저장소에서 작업할 때 따르는 절차다. 새 작업은 아래 흐름을 따른다: **브랜치 생성 → 구현 → `develop`에 PR → 코드 리뷰 → merge**

---

## 1. 브랜치 생성

`develop`을 기준으로 새 브랜치를 만든다. `main`에서 직접 분기하지 않는다.

```bash
git checkout develop
git pull origin develop
git checkout -b feature/loan-list
```

브랜치명은 kebab-case로, 목적에 맞는 접두사를 붙인다.

| 접두사     | 용도         | 예시                |
| ---------- | ------------ | ------------------- |
| `feature/` | 새 기능 개발 | `feature/loan-list` |
| `fix/`     | 버그 수정    | `fix/payment-error` |
| `hotfix/`  | 긴급 수정    | `hotfix/auth-crash` |

---

## 2. 구현

- 폴더 구조·의존성 규칙은 [architecture.md](./architecture.md), 네이밍은 [coding-convention.md](./coding-convention.md)를 따른다.
- 커밋 메시지는 `type(scope): subject` 형식(Conventional Commits)을 사용한다. `feat` / `fix` / `design` / `style` / `refactor` / `docs` / `test` / `chore` 중 하나를 쓴다.
- `scope`는 생략해도 무방하다.

  ```
  feat(loan): 대출 목록 조회 화면 추가
  fix: 대출 목록 렌더링 시 발생하는 오류 수정
  ```

- 커밋하기 전에 `npm run lint`, `npm run build`(컴포넌트 변경 시 `npm run test`)를 직접 실행해 실패 여부를 먼저 확인한다. CI가 잡아주길 기다리지 않는다.
- `git commit` 시 [Git Hooks](../README.md#git-hooks)(Husky + lint-staged)가 스테이징된 파일에 자동으로 lint/format을 실행한다. ESLint 에러가 있으면 커밋이 막히므로, `--no-verify`로 우회하지 말고 에러를 고친 뒤 다시 커밋한다.

---

## 3. `develop`에 PR 생성

- base 브랜치는 항상 `develop`이다. (`main`은 배포 전용이며 직접 PR 대상이 아니다)
- PR 제목/설명에 변경 이유와 확인 방법을 남긴다.
- PR을 올리면 GitHub Actions CI([.github/workflows/ci.yml](../.github/workflows/ci.yml))가 `npm ci → npm run lint → npm run build`를 자동 실행한다. CI가 실패하면 원인을 고치고 커밋을 추가한다.

---

## 4. 코드 리뷰

- 최소 2인 이상의 사람 Approve가 있어야 merge할 수 있다. 이 승인 절차 자체는 에이전트가 대신할 수 없다.
- 리뷰 코멘트가 달리면 반영하거나, 반영하지 않는다면 이유를 코멘트로 남기고 논의한다.
- 리뷰 중 커밋을 추가로 올렸다면 CI가 다시 통과했는지 확인한다.

---

## 5. Merge

- CI 통과 + 리뷰 승인이 모두 끝난 뒤 `develop`으로 merge한다.
- merge 후에는 작업 브랜치를 삭제한다.
- force-push, `--no-verify`, 리뷰/승인 절차 우회는 사용자가 명시적으로 요청하지 않는 한 사용하지 않는다.
