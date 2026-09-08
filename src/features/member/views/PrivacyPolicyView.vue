<script setup>
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'

const EFFECTIVE_DATE = '2026.08.05'

const router = useRouter()
</script>

<template>
  <div class="privacy-view">
    <AppHeader title="개인정보 처리방침" @back="router.back()" />

    <p class="privacy-view__effective-date">시행일자 {{ EFFECTIVE_DATE }}</p>

    <section class="privacy-view__section">
      <p class="privacy-view__text">
        회사는 회원의 개인정보를 중요시하며, 「개인정보보호법」 등 관련 법령을 준수하고 있습니다.
        회사는 개인정보 처리방침을 통해 회원이 제공하는 개인정보가 어떠한 목적과 방식으로 이용되고
        있으며, 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
      </p>
    </section>

    <section class="privacy-view__section">
      <h2 class="privacy-view__section-title">1. 수집하는 개인정보의 항목 및 수집 방법</h2>
      <p class="privacy-view__text">회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.</p>
      <ul class="privacy-view__sub-list">
        <li>회원가입 시: 이메일, 비밀번호, 닉네임</li>
        <li>서비스 이용 과정에서 선택적으로 입력: 소득 분위, 프로필 사진</li>
        <li>
          자산 연동 서비스 이용 시: 회원이 제3자 정보제공에 동의한 범위 내에서 연동 금융회사, 계좌
          정보, 자산·거래 내역 등 마이데이터 정보
        </li>
        <li>서비스 이용 과정에서 자동으로 생성·수집: 접속 로그, 기기 정보, 서비스 이용 기록</li>
      </ul>
    </section>

    <section class="privacy-view__section">
      <h2 class="privacy-view__section-title">2. 개인정보의 수집 및 이용 목적</h2>
      <ol class="privacy-view__list">
        <li>회원 가입의사 확인, 본인 식별·인증, 회원자격 유지·관리</li>
        <li>자산 연동을 통한 통합 자산 현황 조회 및 저축·자산 형성 목표 관리 서비스 제공</li>
        <li>소득 분위 등 정보를 활용한 맞춤형 정책 정보 안내 및 또래 비교 통계 제공</li>
        <li>서비스 이용에 따른 공지사항 전달 및 고객 문의 응대</li>
        <li>부정 이용 방지 및 서비스의 안정적 운영을 위한 통계·분석</li>
      </ol>
    </section>

    <section class="privacy-view__section">
      <h2 class="privacy-view__section-title">3. 개인정보의 보유 및 이용 기간</h2>
      <p class="privacy-view__text">
        회사는 원칙적으로 회원 탈퇴 등 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체
        없이 파기합니다. 다만 관련 법령에 따라 보존할 필요가 있는 경우 회사는 아래와 같이 관계
        법령에서 정한 일정 기간 동안 회원 정보를 보관합니다.
      </p>
      <ul class="privacy-view__sub-list">
        <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
        <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)</li>
        <li>서비스 이용 관련 로그, 접속지 추적자료: 3개월 (통신비밀보호법)</li>
      </ul>
    </section>

    <section class="privacy-view__section">
      <h2 class="privacy-view__section-title">4. 개인정보의 제3자 제공</h2>
      <p class="privacy-view__text">
        회사는 회원의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 아래의 경우에는 예외로
        합니다.
      </p>
      <ul class="privacy-view__sub-list">
        <li>회원이 사전에 별도의 동의를 한 경우</li>
        <li>
          법령의 규정에 의거하거나, 수사 목적으로 법령에서 정한 절차와 방법에 따라 수사기관의 요구가
          있는 경우
        </li>
      </ul>
    </section>

    <section class="privacy-view__section">
      <h2 class="privacy-view__section-title">5. 개인정보 처리의 위탁</h2>
      <p class="privacy-view__text">
        회사는 원활한 서비스 제공을 위해 아래와 같이 개인정보 처리 업무를 외부에 위탁하고 있으며,
        위탁 계약 시 개인정보가 안전하게 관리될 수 있도록 필요한 사항을 규정하고 있습니다.
      </p>
      <div class="privacy-view__table-wrap">
        <table class="privacy-view__table">
          <thead>
            <tr>
              <th>수탁업체</th>
              <th>위탁업무 내용</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>마이데이터 통합인증 서비스 제공업체</td>
              <td>자산 연동을 위한 계좌·거래 정보 조회 중계</td>
            </tr>
            <tr>
              <td>클라우드 인프라 제공업체</td>
              <td>서비스 운영을 위한 데이터 보관 및 시스템 호스팅</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="privacy-view__section">
      <h2 class="privacy-view__section-title">6. 정보주체의 권리·의무 및 행사 방법</h2>
      <p class="privacy-view__text">
        회원은 언제든지 마이페이지를 통해 본인의 개인정보를 조회, 수정할 수 있으며, 회원 탈퇴를 통해
        개인정보의 수집 및 이용 동의를 철회할 수 있습니다. 또한 개인정보 열람, 정정·삭제, 처리정지를
        요청할 수 있으며, 이 경우 회사는 관련 법령에 따라 지체 없이 필요한 조치를 취합니다.
      </p>
    </section>

    <section class="privacy-view__section">
      <h2 class="privacy-view__section-title">7. 개인정보의 파기 절차 및 방법</h2>
      <ol class="privacy-view__list">
        <li>
          전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여
          삭제합니다.
        </li>
        <li>종이 문서에 기록·저장된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.</li>
      </ol>
    </section>

    <section class="privacy-view__section">
      <h2 class="privacy-view__section-title">8. 개인정보의 안전성 확보조치</h2>
      <p class="privacy-view__text">
        회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.
      </p>
      <ul class="privacy-view__sub-list">
        <li>비밀번호 등 주요 정보의 암호화 저장 및 전송</li>
        <li>개인정보에 대한 접근 권한 관리 및 접근 통제</li>
        <li>개인정보 처리시스템에 대한 접속기록의 보관 및 위·변조 방지</li>
        <li>해킹 등에 대비한 보안 프로그램의 설치 및 주기적 갱신·점검</li>
      </ul>
    </section>

    <section class="privacy-view__section">
      <h2 class="privacy-view__section-title">9. 개인정보 보호책임자</h2>
      <p class="privacy-view__text">
        회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 회원의 불만처리
        및 피해구제를 위해 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
      </p>
      <ul class="privacy-view__sub-list">
        <li>개인정보 보호책임자: 개인정보보호팀</li>
        <li>연락처: privacy@example.com</li>
      </ul>
    </section>

    <section class="privacy-view__section privacy-view__section--last">
      <h2 class="privacy-view__section-title">10. 고지의 의무</h2>
      <p class="privacy-view__text">
        이 개인정보 처리방침은 법령·정책 또는 서비스 내용의 변경에 따라 개정될 수 있으며, 개정하는
        경우 시행일자 및 개정 내용을 서비스 내 공지사항을 통해 고지합니다. 이 방침은
        {{ EFFECTIVE_DATE }}부터 시행됩니다.
      </p>
    </section>
  </div>
</template>

<style scoped>
.privacy-view {
  display: flex;
  flex-direction: column;
  padding-bottom: 32px;
}

/*
  legacy --text-h / --text / --border는 main.css의 [data-theme] 블록에 없어서 테마를
  따라가지 않는다. 특히 --text-h(#ffffff 고정) 때문에 라이트에서 조 제목이 사라졌다.
  공용 시맨틱 토큰으로 바꾼다.
*/

.privacy-view__effective-date {
  margin: 0 0 8px;
  padding: 0 4px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.privacy-view__section {
  padding: 16px 4px 0;
  border-top: 1px solid var(--color-border);
  margin-top: 16px;
}

.privacy-view__section:first-of-type {
  border-top: none;
  margin-top: 0;
}

.privacy-view__section--last {
  padding-bottom: 4px;
}

.privacy-view__section-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.privacy-view__text {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.privacy-view__list {
  margin: 8px 0 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.privacy-view__sub-list {
  margin: 8px 0 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  list-style: circle;
}

.privacy-view__table-wrap {
  margin-top: 10px;
  overflow-x: auto;
}

.privacy-view__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.privacy-view__table th,
.privacy-view__table td {
  padding: 8px;
  border: 1px solid var(--color-border);
  text-align: left;
  white-space: nowrap;
}

.privacy-view__table th {
  color: var(--color-text-primary);
  font-weight: 500;
  background: var(--color-app-bg);
}
</style>
