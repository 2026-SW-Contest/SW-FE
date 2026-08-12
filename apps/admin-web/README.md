# Connecthing Admin

학생용 모바일 웹과 별도로 실행되는 데스크톱 관리자 애플리케이션입니다.

```bash
npm run dev:admin
npm run build:admin
```

관리 상태는 서비스 전체에서 다음 세 단계만 사용합니다.

- `waiting`: 대기
- `inProgress`: 진행중
- `resolved`: 해결완료

소유자 확인 요청이 접수되면 `진행중`이 되며, 반려해도 `진행중`을 유지합니다.
승인 처리하면 `해결완료`로 변경됩니다.
