<p align="center">
  <img src="./public/assets/images/Title.png" alt="VelDoc" width="460" />
</p>

<p align="center">
  <img src="./public/assets/images/icon.png" alt="VelDoc icon" width="96" />
</p>

<p align="center">
  개발 중 생기는 문서를 한곳에서 쉽고 일관되게 작성하는 웹 기반 문서 도구
</p>

# VelDoc

VelDoc은 개발 문서를 위한 에디터들이 모이는 작은 작업대입니다.

API 명세서, 테이블 정의서, 기능 정리 문서처럼 프로젝트를 만들며 계속 생겨나는 문서를 각 목적에 맞는 화면으로 작성하고, 깔끔한 Markdown 문서로 정리하는 것을 목표로 합니다.

지금은 API 명세서 작성기부터 시작합니다.
이후 개발 과정에서 자주 필요한 문서 에디터를 하나씩 더해갈 예정입니다.

## 작업 공간

VelDoc은 먼저 문서를 모아둘 프로젝트 폴더를 선택합니다.

선택한 폴더 안에 `veldoc` 공간을 만들고, 문서 종류별 폴더를 나눠 관리합니다.

- `veldoc/api` API 명세서
- `veldoc/wbs` WBS
- `veldoc/srs` 요구사항 정의서
- `veldoc/fsd` 기능 명세서
- `veldoc/table` DB 테이블 정의서

현재 작성 가능한 에디터는 API 명세서입니다.
나머지 문서 버튼은 준비 중입니다.

## 무엇을 하나요?

<table>
  <tr>
    <td width="48" align="center">
      <img src="./public/assets/images/favicon.ico" alt="" width="28" />
    </td>
    <td>
      <strong>문서를 쉽게 작성합니다.</strong><br />
      빈 Markdown을 직접 다듬는 대신, 문서에 필요한 항목을 화면에서 채워 넣습니다.
    </td>
  </tr>
  <tr>
    <td width="48" align="center">
      <img src="./public/assets/images/favicon.ico" alt="" width="28" />
    </td>
    <td>
      <strong>형식을 일관되게 맞춥니다.</strong><br />
      사람마다 달라지는 문서 구조를 정리된 양식으로 맞춥니다.
    </td>
  </tr>
  <tr>
    <td width="48" align="center">
      <img src="./public/assets/images/favicon.ico" alt="" width="28" />
    </td>
    <td>
      <strong>Markdown으로 남깁니다.</strong><br />
      작성한 내용은 공유하고 보관하기 쉬운 Markdown 문서로 정리됩니다.
    </td>
  </tr>
  <tr>
    <td width="48" align="center">
      <img src="./public/assets/images/favicon.ico" alt="" width="28" />
    </td>
    <td>
      <strong>폴더 단위로 봅니다.</strong><br />
      열린 폴더의 문서를 파일 트리와 뷰어로 함께 확인할 수 있습니다.
    </td>
  </tr>
</table>

## 지금 들어있는 에디터

### API 명세서 작성기

요청 정보, Headers, Path Params, Query Params, Body, Response, Error를 입력하고 API 명세서를 Markdown으로 생성합니다.

- 요청과 응답 구조 정리
- Method별 색상 카드와 Path 구성
- Header 자동 추천과 프리셋 추가
- 인증 방식과 적용 범위별 Role 관리
- 상태 코드별 Success Response 작성
- Error Response 프리셋 추가
- 파일 구조와 명세서 뷰어 전환
- 새문서, 저장, 새 파일 저장, 삭제
- 새로고침 후 열린 문서 복구
- 단축키와 도우미 팝업

## 앞으로 담을 문서들

VelDoc은 API 명세서만을 위한 도구가 아닙니다.

개발하면서 반복해서 작성하는 문서를 하나씩 에디터로 만들고, 같은 공간에서 관리할 수 있게 확장해갑니다.

- WBS
- 요구사항 정의서
- 기능 명세서
- DB 테이블 정의서

## VelDoc의 방향

<p>
  <img src="./public/assets/images/Title.png" alt="VelDoc title" width="260" />
</p>

입력은 쉽게, 결과는 일관되게.

VelDoc은 거대한 문서 시스템보다 가벼운 작성 흐름을 지향합니다.
필요한 문서를 빠르게 만들고, 팀이 같은 형식으로 읽고 관리할 수 있도록 차분하게 다듬어갑니다.
