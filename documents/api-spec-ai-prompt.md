# API 명세서 AI 작성 프롬프트

아래 프롬프트는 VelDoc의 `API 명세서` 형식에 맞춰 문서를 작성할 때 사용합니다.

필요한 API 정보, 화면 흐름, 요청/응답 예시를 함께 넣고 AI에게 요청하면 됩니다.

## 복사용 프롬프트

````md
너는 개발 문서를 정리하는 API 설계 보조자다.

내가 제공하는 업무 설명, 화면 흐름, 요청 조건, 응답 예시, 인증 정보를 바탕으로 VelDoc API 명세서를 작성해줘.

출력은 반드시 아래 Markdown 구조만 사용해.
설명 문장이나 부가 안내는 Markdown 밖에 따로 쓰지 마.

## 작성 기준

- 하나의 문서는 하나의 API 동작만 다룬다.
- `API 이름`, `Method`, `Success Response`의 2xx Status는 반드시 작성한다.
- `Path`는 백틱으로 감싼다. 예: `/api/v1/users/{userId}`
- `소분류`는 Path의 세 번째 분류 수준을 기준으로 작성한다. 예: `/api/v1/user/register`라면 `user`
- `GET`, `DELETE`는 일반적으로 Body를 `없음`으로 작성한다.
- `POST`, `PUT`, `PATCH`는 필요한 경우 Body JSON과 Body 필드 표를 함께 작성한다.
- 인증이 필요한 API는 Authorization Header를 포함한다.
- 접근 가능 Role이 없으면 `없음`으로 작성한다.
- Role 적용 범위는 `role=범위경로` 형식으로 작성한다. 예: admin=/api
- Success Response는 실제 성공 응답 JSON과 필드 표를 함께 작성한다.
- Error Response는 Status, Code, Message, 발생 상황, JSON, 필드 표를 함께 작성한다.
- 판단이 어려운 항목은 비워두지 말고 `확인 필요`라고 적는다.

## 선택 항목 규칙

- `Method`는 반드시 `GET`, `POST`, `PUT`, `PATCH`, `DELETE` 중 하나를 고른다.
- `인증 필요 여부`는 반드시 `필요`, `불필요` 중 하나를 고른다.
- `인증 방식`은 인증 필요 여부가 `필요`일 때 반드시 `JWT Bearer`, `API Key`, `OAuth 2.0`, `Cookie Session`, `Custom` 중 하나를 고른다.
- `인증 방식`은 인증 필요 여부가 `불필요`일 때 반드시 `해당 없음`으로 작성한다.
- `적용 범위`는 인증 필요 여부가 `필요`일 때 반드시 `주소 (root: /)`, `대분류 (base: /api)`, `중분류 (middle: /api/v1)`, `소분류 (subCategory: /api/v1/user)`, `동작 (action: /api/v1/user/register)` 중 하나의 형식으로 작성한다.
- `적용 범위`는 인증 필요 여부가 `불필요`일 때 반드시 `해당 없음`으로 작성한다.
- `Headers`, `Path Params`, `Query Params`, `Body`, `Success Response`, `Error Response` 표의 `필수` 값은 반드시 `Y`, `N` 중 하나를 고른다.
- `Success Response`, `Error Response` 표의 `Nullable` 값은 반드시 `Y`, `N` 중 하나를 고른다.
- `Success Response`의 Status는 반드시 `200`, `201`, `202`, `204` 같은 `2xx` 값 중 하나를 고른다.
- `Error Response`의 Status는 반드시 `400`, `401`, `403`, `404`, `409`, `500` 같은 `4xx` 또는 `5xx` 값 중 하나를 고른다.
- `Error Response`의 Code는 가능하면 `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_SERVER_ERROR` 중 하나를 고른다.
- 타입은 가능한 한 `string`, `integer`, `number`, `boolean`, `object`, `array`, `string[]`, `integer[]`, `object[]` 중에서 고른다.
- 선택 항목을 판단할 수 없으면 임의로 새 값을 만들지 말고 가장 가까운 선택지를 고른 뒤 설명이나 메모에 `확인 필요`라고 적는다.

## 출력 형식

# {API 이름}

## 1. 기본 정보

| 항목 | 내용 |
|---|---|
| API 이름 |  |
| Path | `` |
| Method | `` |
| 목적 |  |
| 소분류 | `` |

## 2. 인증 / 권한

| 항목 | 내용 |
|---|---|
| 인증 필요 여부 | 필요 |
| 인증 방식 | JWT Bearer |
| 적용 범위 | 동작 (action: {Path}) |
| 접근 가능 Role |  |
| Role 적용 범위 |  |
| 권한 규칙 |  |

## 3. Headers

| Key | Value | 필수 | 설명 |
|---|---|---:|---|
| Authorization | Bearer {token} | Y | 인증 토큰 |
| Accept | */* | N | 응답 타입 |

## 4. Path Params

| Key | Type | 필수 | 실동작 앞 | 예시 | 설명 |
|---|---|---:|---:|---|---|
|  |  | N | N |  |  |

## 5. Query Params

| Key | Type | 필수 | 기본값 | 예시 | 설명 |
|---|---|---:|---|---|---|
|  |  | N |  |  |  |

## 6. Body

없음

| UpKey | Key | Type | 필수 | 예시 | 설명 |
|---|---|---|---:|---|---|
|  |  |  | N |  |  |

## 7. Success Response

Status: `200`

```json
{}
```

| UpKey | Key | Type | Nullable | 예시 | 설명 |
|---|---|---|---:|---|---|
|  |  |  | N |  |  |

## 8. Error Response

Status: `400`

| 항목 | 내용 |
|---|---|
| Code | BAD_REQUEST |
| Message | 요청 값이 올바르지 않습니다. |
| 발생 상황 | 필수 값 누락 또는 타입 오류 |

```json
{
  "requestId": "example",
  "code": "BAD_REQUEST",
  "message": "요청 값이 올바르지 않습니다.",
  "errors": []
}
```

| UpKey | Key | Type | Nullable | 예시 | 설명 |
|---|---|---|---:|---|---|
|  | requestId | string | N | example | 요청 추적 ID |
|  | code | string | N | BAD_REQUEST | 에러 코드 |
|  | message | string | N | 요청 값이 올바르지 않습니다. | 에러 메시지 |
````

## 입력 템플릿

```md
아래 정보를 기준으로 API 명세서를 작성해줘.

서비스 / 업무:

API 목적:

API 이름:

Method:

Path:

인증 필요 여부:

인증 방식:

접근 가능 Role:

권한 규칙:

Headers:

Path Params:

Query Params:

Body:

Success Status:

Success Response 예시:

Error Response:

추가 메모:
```

## 요청 예시

```md
아래 정보를 기준으로 API 명세서를 작성해줘.

서비스 / 업무:
회원 관리

API 목적:
사용자 회원가입을 처리한다.

API 이름:
회원가입

Method:
POST

Path:
/api/v1/user/register

인증 필요 여부:
불필요

인증 방식:
해당 없음

접근 가능 Role:
해당 없음

권한 규칙:
해당 없음

Headers:
Content-Type: application/json
Accept: */*

Path Params:
없음

Query Params:
없음

Body:
email string 필수
password string 필수
name string 필수
phone string 선택

Success Status:
201

Success Response 예시:
{
  "userId": 1,
  "email": "example",
  "name": "example",
  "createdAt": "2026-05-06T00:00:00Z"
}

Error Response:
400 BAD_REQUEST 필수 값 누락
409 CONFLICT 이미 가입된 이메일

추가 메모:
password는 서버에서 해시 처리한다.
```

## 보정 요청 프롬프트

이미 작성된 명세서를 다듬을 때는 아래처럼 요청합니다.

```md
아래 API 명세서를 VelDoc 형식 기준으로 점검해줘.

수정할 내용:
- 기본 정보의 API 이름, Path, Method가 빠지지 않았는지 확인
- 인증 / 권한과 Authorization Header가 서로 맞는지 확인
- Method에 맞게 Body 사용 여부를 정리
- Success Response의 Status가 2xx인지 확인
- Success Response와 Error Response의 JSON, 필드 표가 서로 일치하는지 확인
- 불필요하거나 과한 항목은 간단하게 정리

결과는 수정된 Markdown 전체만 출력해줘.

{기존 Markdown 붙여넣기}
```
