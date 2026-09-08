<script setup>
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'

const EFFECTIVE_DATE = '2026.08.05'

const router = useRouter()
</script>

<template>
  <div class="terms-view">
    <AppHeader title="이용약관" @back="router.back()" />

    <p class="terms-view__effective-date">시행일자 {{ EFFECTIVE_DATE }}</p>

    <section class="terms-view__section">
      <h2 class="terms-view__section-title">제1조 (목적)</h2>
      <p class="terms-view__text">
        이 약관은 서비스(이하 "회사")가 제공하는 자산 관리 및 저축 목표 서비스(이하 "서비스")의
        이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 이용조건 및 절차 등 기본적인 사항을
        정함을 목적으로 합니다.
      </p>
    </section>

    <section class="terms-view__section">
      <h2 class="terms-view__section-title">제2조 (용어의 정의)</h2>
      <p class="terms-view__text">이 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
      <ol class="terms-view__list">
        <li>
          "서비스"란 회원이 자산 현황을 조회하고, 저축·자산 형성 목표를 설정·관리하며, 관련 정책
          정보를 비교·확인할 수 있도록 회사가 제공하는 일체의 서비스를 의미합니다.
        </li>
        <li>
          "회원"이란 이 약관에 동의하고 회사와 서비스 이용계약을 체결하여 서비스를 이용하는 자를
          의미합니다.
        </li>
        <li>
          "자산 연동"이란 회원이 본인 명의의 금융회사 계좌 등의 정보를 제3자 정보제공 동의 절차를
          통해 서비스에 연결하여 통합 조회하는 기능을 의미합니다.
        </li>
        <li>
          "아이디(ID)"란 회원의 식별과 서비스 이용을 위해 회원이 설정하고 회사가 승인한 정보를
          의미합니다.
        </li>
      </ol>
    </section>

    <section class="terms-view__section">
      <h2 class="terms-view__section-title">제3조 (약관의 효력 및 변경)</h2>
      <ol class="terms-view__list">
        <li>
          이 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이
          발생합니다.
        </li>
        <li>
          회사는 관련 법령을 위반하지 않는 범위에서 이 약관을 변경할 수 있으며, 변경 시 적용일자 및
          변경 사유를 명시하여 적용일자 7일 전부터 서비스 내에 공지합니다. 다만 회원에게 불리한
          변경의 경우 30일 전부터 공지하며, 별도로 명확히 통지합니다.
        </li>
        <li>
          회원이 변경된 약관에 동의하지 않는 경우 회원은 이용계약을 해지할 수 있으며, 공지 후에도
          서비스를 계속 이용하는 경우 변경된 약관에 동의한 것으로 봅니다.
        </li>
      </ol>
    </section>

    <section class="terms-view__section">
      <h2 class="terms-view__section-title">제4조 (서비스의 제공 및 변경)</h2>
      <ol class="terms-view__list">
        <li>
          회사는 회원에게 아래와 같은 서비스를 제공합니다.
          <ul class="terms-view__sub-list">
            <li>자산 연동 및 통합 자산 현황 조회 서비스</li>
            <li>저축·자산 형성 목표 설정 및 진행 현황 관리 서비스</li>
            <li>또래 비교 등 통계 정보 제공 서비스</li>
            <li>정책 상품 정보 비교 및 안내 서비스</li>
            <li>그 밖에 회사가 추가로 개발하거나 제휴를 통해 제공하는 서비스</li>
          </ul>
        </li>
        <li>
          회사는 서비스의 내용, 운영상·기술상 필요에 따라 제공 중인 서비스의 전부 또는 일부를 변경할
          수 있으며, 이 경우 변경 사유와 내용을 사전에 공지합니다.
        </li>
        <li>
          회사는 시스템 점검, 교체 및 고장, 통신 두절 등 운영상 상당한 이유가 있는 경우 서비스
          제공을 일시적으로 중단할 수 있습니다.
        </li>
      </ol>
    </section>

    <section class="terms-view__section">
      <h2 class="terms-view__section-title">제5조 (이용계약의 성립 및 회원가입)</h2>
      <ol class="terms-view__list">
        <li>
          이용계약은 회원이 되고자 하는 자가 약관 내용에 동의하고 회사가 정한 가입 절차에 따라
          회원가입을 신청한 후, 회사가 이를 승낙함으로써 성립합니다.
        </li>
        <li>
          회사는 다음 각 호에 해당하는 신청에 대해서는 승낙을 하지 않거나 사후에 이용계약을 해지할
          수 있습니다.
          <ul class="terms-view__sub-list">
            <li>타인의 명의를 이용하거나 허위 정보를 기재한 경우</li>
            <li>만 14세 미만 아동이 법정대리인의 동의 없이 가입을 신청한 경우</li>
            <li>이미 가입된 회원과 동일한 명의로 재가입을 신청하는 경우</li>
            <li>그 밖에 관련 법령 또는 회사가 정한 기준을 위반한 경우</li>
          </ul>
        </li>
      </ol>
    </section>

    <section class="terms-view__section">
      <h2 class="terms-view__section-title">제6조 (회원 탈퇴 및 자격 상실)</h2>
      <ol class="terms-view__list">
        <li>
          회원은 마이페이지 내 탈퇴 기능을 통해 언제든지 이용계약 해지(탈퇴)를 신청할 수 있습니다.
        </li>
        <li>
          회사는 회원이 다음 각 호에 해당하는 경우 사전 통지 후 이용계약을 해지하거나 서비스 이용을
          제한할 수 있습니다.
          <ul class="terms-view__sub-list">
            <li>가입 신청 시 허위 내용을 등록한 경우</li>
            <li>
              타인의 서비스 이용을 방해하거나 정보를 도용하는 등 부정하게 서비스를 이용한 경우
            </li>
            <li>서비스 운영을 고의로 방해한 경우</li>
            <li>관련 법령 또는 이 약관을 위반한 경우</li>
          </ul>
        </li>
      </ol>
    </section>

    <section class="terms-view__section">
      <h2 class="terms-view__section-title">제7조 (개인정보의 보호)</h2>
      <p class="terms-view__text">
        회사는 관련 법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력하며, 개인정보의
        수집, 이용, 제공 등에 관한 세부적인 사항은 별도로 정한
        <router-link class="terms-view__inline-link" :to="{ name: 'privacy' }">
          개인정보 처리방침
        </router-link>
        에 따릅니다.
      </p>
    </section>

    <section class="terms-view__section">
      <h2 class="terms-view__section-title">제8조 (회원의 의무)</h2>
      <p class="terms-view__text">
        회원은 관련 법령, 이 약관의 규정, 이용안내 및 서비스와 관련하여 회사가 공지하는 사항을
        준수해야 하며, 다음 각 호의 행위를 하여서는 안 됩니다.
      </p>
      <ul class="terms-view__sub-list">
        <li>신청 또는 변경 시 허위 내용을 등록하는 행위</li>
        <li>타인의 정보를 도용하거나 부정하게 사용하는 행위</li>
        <li>회사가 제공하는 정보를 무단으로 복제, 배포, 이용하는 행위</li>
        <li>서비스의 안정적 운영을 방해할 수 있는 정보나 데이터를 전송하는 행위</li>
      </ul>
    </section>

    <section class="terms-view__section">
      <h2 class="terms-view__section-title">제9조 (서비스 이용의 제한)</h2>
      <p class="terms-view__text">
        회사는 회원이 이 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 사전 통지 후
        서비스 이용을 경고, 일시정지, 영구이용정지 등으로 단계적으로 제한할 수 있습니다.
      </p>
    </section>

    <section class="terms-view__section">
      <h2 class="terms-view__section-title">제10조 (면책조항)</h2>
      <ol class="terms-view__list">
        <li>
          회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력적인 사유로 서비스를 제공할
          수 없는 경우 책임이 면제됩니다.
        </li>
        <li>
          서비스 내 제공되는 정책 정보, 통계, 자산 현황 등은 참고용 정보이며, 회사는 이를 근거로 한
          회원의 의사결정 및 그 결과에 대해 법률상 책임을 지지 않습니다. 정확한 정보는 관련 기관
          또는 금융회사를 통해 확인하시기 바랍니다.
        </li>
        <li>
          회사는 회원이 서비스를 이용하여 기대하는 효익을 얻지 못한 것에 대하여 책임을 지지 않으며,
          회원 간 또는 회원과 제3자 상호간에 서비스를 매개로 발생한 분쟁에 대해 개입할 의무가
          없습니다.
        </li>
      </ol>
    </section>

    <section class="terms-view__section">
      <h2 class="terms-view__section-title">제11조 (분쟁 해결 및 준거법)</h2>
      <p class="terms-view__text">
        이 약관과 관련하여 회사와 회원 간에 발생한 분쟁에 대해서는 대한민국 법을 준거법으로 하며,
        분쟁이 발생할 경우 민사소송법상의 관할 법원에 소를 제기합니다.
      </p>
    </section>

    <section class="terms-view__section terms-view__section--last">
      <h2 class="terms-view__section-title">부칙</h2>
      <p class="terms-view__text">이 약관은 {{ EFFECTIVE_DATE }}부터 시행됩니다.</p>
    </section>
  </div>
</template>

<style scoped>
.terms-view {
  display: flex;
  flex-direction: column;
  padding-bottom: 32px;
}

/*
  legacy --text-h / --text / --border는 main.css의 [data-theme] 블록에 없어서 테마를
  따라가지 않는다. 특히 --text-h(#ffffff 고정) 때문에 라이트에서 조 제목이 사라졌다.
  공용 시맨틱 토큰으로 바꾼다.
*/

.terms-view__effective-date {
  margin: 0 0 8px;
  padding: 0 4px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.terms-view__section {
  padding: 16px 4px 0;
  border-top: 1px solid var(--color-border);
  margin-top: 16px;
}

.terms-view__section:first-of-type {
  border-top: none;
  margin-top: 0;
}

.terms-view__section--last {
  padding-bottom: 4px;
}

.terms-view__section-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.terms-view__text {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.terms-view__list {
  margin: 8px 0 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.terms-view__sub-list {
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

.terms-view__inline-link {
  color: var(--color-heading-accent);
  text-decoration: underline;
}
</style>
