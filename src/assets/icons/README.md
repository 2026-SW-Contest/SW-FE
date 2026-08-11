# Icon assets

아이콘은 처음 사용된 화면이 아니라 의미와 역할을 기준으로 분류합니다.

## Directory structure

- `account`: 프로필 등 계정 관련 아이콘
- `actions`: 클릭으로 동작을 수행하는 범용 아이콘과 액션 에셋
- `brand`: 서비스 로고와 심벌
- `navigation`: 하단 내비게이션 아이콘
- `notifications`: 알림과 알림 상태
- `placeholders`: 이미지가 없을 때 사용하는 대체 그래픽
- `status`: 서비스 처리 상태 배지

## Naming rules

- 파일명은 영문 소문자 `kebab-case`를 사용합니다.
- 이름은 Figma 레이어명이 아니라 화면에서의 의미를 나타냅니다.
- 기본 상태에는 접미사를 붙이지 않고 변형 상태에 `-active`를 붙입니다.
- 크기(`small`, `24px`)는 실제로 별도 에셋을 구분해야 할 때만 이름에 포함합니다.
- 동일한 SVG를 폴더별로 복제하지 않고 하나의 파일을 공유합니다.

예: `navigation/home.svg`, `navigation/home-active.svg`, `actions/clear-input.svg`
