<p align="center">
  <img src="./public/assets/images/Title.png" alt="VelDoc" width="460" />
</p>

<p align="center">
  개발 중 생기는 문서를 한곳에서 작성하고, Markdown으로 남기는 웹 기반 문서 도구
</p>

<p align="center">
  <strong><a href="https://veldoc.ipstein.myds.me/">VelDoc 이용하기</a></strong>
</p>

# VelDoc

VelDoc은 개발 문서를 더 쉽고 일관되게 작성하기 위한 작은 문서 작업대입니다.

빈 Markdown을 직접 다듬는 대신, 문서에 맞는 입력 화면에서 필요한 내용을 채우고 깔끔한 Markdown 파일로 저장합니다.

## 문서 작업 공간

프로젝트 폴더를 선택하면 VelDoc은 그 안에 `veldoc` 작업 공간을 만들고, 문서 종류별로 파일을 나눠 관리합니다.

- `veldoc/wbs` WBS
- `veldoc/api` API 명세서
- `veldoc/table` DB 테이블 정의서

새 문서 작성, 저장, 새 파일 저장, 삭제, 파일 구조 보기, 문서 뷰어 전환을 한 화면에서 처리할 수 있습니다.

## 에디터

<table>
  <tr>
    <td width="72" align="center">
      <img src="./public/assets/images/welshcorgi.png" alt="WBS" width="52" />
    </td>
    <td>
      <strong>WBS</strong><br />
      프로젝트명, 내부 코드, 버전, 담당자와 목표를 정리합니다.<br />
      WBS 번호, 작업, 담당자, 일정, 산출물을 카드 형태로 작성하고 기간과 진행률을 자동 계산합니다.
    </td>
  </tr>
  <tr>
    <td width="72" align="center">
      <img src="./public/assets/images/bordercoli.png" alt="API 명세서" width="52" />
    </td>
    <td>
      <strong>API 명세서</strong><br />
      요청 정보, Headers, Params, Body, Success Response, Error Response를 정리합니다.<br />
      인증 방식, 접근 Role, 상태 코드, Header 프리셋까지 함께 기록할 수 있습니다.
    </td>
  </tr>
  <tr>
    <td width="72" align="center">
      <img src="./public/assets/images/germanshepherd.png" alt="DB 테이블 정의서" width="52" />
    </td>
    <td>
      <strong>DB 테이블 정의서</strong><br />
      테이블 기본 정보, 컬럼, 인덱스, 제약조건, 운영 정보를 정리합니다.<br />
      작성한 내용을 바탕으로 SQL 초안도 자동으로 생성합니다.
    </td>
  </tr>
</table>

## VelDoc이 해주는 것

- 문서별 입력 화면으로 작성 흐름을 단순하게 만듭니다.
- 프로젝트 안의 문서를 같은 구조와 같은 톤으로 정리합니다.
- 작성 결과를 Markdown 파일로 남겨 보관과 공유가 쉽습니다.
- 왼쪽 파일 목록에서 저장된 문서를 다시 열고 관리할 수 있습니다.
- 작성일, 수정일, 기간, 진행률처럼 반복되는 값은 자동으로 채웁니다.
- 필수값과 중복 파일을 확인해 잘못된 문서 저장을 줄입니다.

## 앞으로

VelDoc은 개발 과정에서 반복해서 작성하는 문서를 하나씩 전용 에디터로 확장해갑니다.

- `요구사항 정의서` 필요한 기능과 조건을 구조화하는 문서
- `기능 명세서` 화면, 동작, 예외 흐름을 구체적으로 남기는 문서
- `테스트 시나리오` 테스트 흐름과 검증 조건을 정리하는 문서

각 문서는 VelDoc의 같은 작업 공간 안에서 관리되고, 작성 결과는 Markdown으로 저장됩니다.

## 방향

VelDoc은 복잡한 문서 시스템보다 가벼운 작성 경험을 지향합니다.

필요한 문서를 빠르게 만들고, 팀이 같은 형식으로 읽고 관리할 수 있게 다듬어갑니다.
