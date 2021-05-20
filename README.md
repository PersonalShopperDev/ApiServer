## npm Script

### npm start
- 실 서버에서 배포 후 서버 시작 때 사용할 명령어
### npm run dev
- 로컬 서버에서 테스트를 위해 실행할 명령어
### npm run deploy
- eb를 이용하여 컴파일 및 배포
### npm test
- test 코드 전체 실행

## Naming Convention
|이름|기본|
|---|---|
|파일|kebab-case|
|함수|camelCase|
|변수|camelCase|
|상수|UPPER_SNAKE_CASE|
|Class|PascalCase|
|Interface|PascalCase|
|Enum|PascalCase|
|NameSpace|PascalCase|
|Type|PascalCase|

## Directory Structure

### /dist
- Type Script 를 Java Script로 컴파일 한 코드
- git Ignore 처리가 되어 있다.
### /docs
- API 문서를 작성하는데 필요한 파일들 (.yaml)
- Swagger을 이용하고 있다.
### /src
- ### /config
    - 설정 파일
    - Auth와 관련된 미들웨어
- ### /routes
    - 기능별로 디렉토리를 생성하여 router, controller, service, model을 둔다.
    - ### /auth
        - 로그인과 관련된 기능들
### /test
- 테스트 코드