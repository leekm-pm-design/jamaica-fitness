// src/components/TermsModal.tsx
'use client';

import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
}

export default function TermsModal({ isOpen, onClose, onAgree }: Props) {
  const [currentTab, setCurrentTab] = useState<'terms' | 'privacy'>('terms');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Jamaica Fitness 이용약관 및 개인정보처리방침
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 탭 */}
        <div className="flex border-b">
          <button
            onClick={() => setCurrentTab('terms')}
            className={`px-6 py-3 font-medium ${
              currentTab === 'terms'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            이용약관
          </button>
          <button
            onClick={() => setCurrentTab('privacy')}
            className={`px-6 py-3 font-medium ${
              currentTab === 'privacy'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            개인정보처리방침
          </button>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentTab === 'terms' ? (
            <div className="space-y-6 text-sm leading-relaxed">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">제1조 (목적)</h3>
                <p className="text-gray-700">
                  본 약관은 Jamaica Fitness(이하 &quot;회사&quot;라 한다)가 운영하는 피트니스 센터에서
                  제공하는 운동시설 및 부대서비스의 이용과 관련하여 회사와 이용고객(이하 &quot;회원&quot;이라 한다)
                  간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">제2조 (정의)</h3>
                <div className="space-y-2 text-gray-700">
                  <p>1. &quot;헬스장&quot;이란 회사가 운영하는 피트니스 센터를 말합니다.</p>
                  <p>2. &quot;회원&quot;이란 회사와 이용계약을 체결하고 회원증을 발급받아 헬스장을 이용하는 자를 말합니다.</p>
                  <p>3. &quot;회원권&quot;이란 헬스장 이용 권한을 부여하는 이용권을 말합니다.</p>
                  <p>4. &quot;운동시설&quot;이란 헬스장 내 설치된 각종 운동기구 및 부대시설을 말합니다.</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">제3조 (회원가입 및 이용계약)</h3>
                <div className="space-y-2 text-gray-700">
                  <p>1. 회원가입을 원하는 자는 본 약관에 동의하고 소정의 절차를 거쳐 가입할 수 있습니다.</p>
                  <p>2. 회원은 실명으로 가입하여야 하며, 타인의 명의를 사용할 수 없습니다.</p>
                  <p>3. 만 14세 미만의 경우 법정대리인의 동의가 필요합니다.</p>
                  <p>4. 회사는 다음 각 호에 해당하는 경우 가입을 거절할 수 있습니다:</p>
                  <div className="ml-4 space-y-1">
                    <p>- 신청서 내용이 허위인 경우</p>
                    <p>- 이전에 회원자격을 상실한 적이 있는 경우</p>
                    <p>- 기타 회사가 정한 가입조건에 부합하지 않는 경우</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">제4조 (시설 이용)</h3>
                <div className="space-y-2 text-gray-700">
                  <p>1. 회원은 영업시간 내에 운동시설을 이용할 수 있습니다.</p>
                  <p>2. 운영시간: 평일 06:00 ~ 24:00, 주말 08:00 ~ 22:00</p>
                  <p>3. 회원은 시설 이용 시 다음 사항을 준수하여야 합니다:</p>
                  <div className="ml-4 space-y-1">
                    <p>- 운동복 및 운동화 착용</p>
                    <p>- 운동기구 사용 후 정리정돈</p>
                    <p>- 타인에게 피해를 주는 행위 금지</p>
                    <p>- 시설 내 금연</p>
                    <p>- 음주 후 시설 이용 금지</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">제5조 (회원의 의무)</h3>
                <div className="space-y-2 text-gray-700">
                  <p>1. 회원은 본인의 건강상태를 정확히 신고하여야 합니다.</p>
                  <p>2. 운동 중 발생할 수 있는 부상에 대해 주의의무를 다하여야 합니다.</p>
                  <p>3. 회원증을 타인에게 양도하거나 대여할 수 없습니다.</p>
                  <p>4. 개인 소지품은 본인이 직접 관리하여야 합니다.</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">제6조 (회원권 및 이용료)</h3>
                <div className="space-y-2 text-gray-700">
                  <p>1. 회원권의 종류 및 이용료는 다음과 같습니다:</p>
                  <div className="ml-4 space-y-1">
                    <p>- 1개월권: 80,000원</p>
                    <p>- 3개월권: 210,000원 (월 70,000원)</p>
                    <p>- 6개월권: 390,000원 (월 65,000원)</p>
                    <p>- 12개월권: 720,000원 (월 60,000원)</p>
                  </div>
                  <p>2. 회원권 기간은 등록일로부터 해당 기간만큼 유효합니다.</p>
                  <p>3. 이용료는 계약 시 일시불로 납부하는 것을 원칙으로 합니다.</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">제7조 (환불 및 양도)</h3>
                <div className="space-y-2 text-gray-700">
                  <p>1. 회원이 중도 해약을 요청하는 경우, 소비자보호법에 따라 환불합니다.</p>
                  <p>2. 환불 기준:</p>
                  <div className="ml-4 space-y-1">
                    <p>- 서비스 개시 전: 납부금액의 100%</p>
                    <p>- 1개월 미만 이용: 납부금액의 80%</p>
                    <p>- 1개월 이상 3개월 미만 이용: 납부금액의 60%</p>
                    <p>- 3개월 이상 이용: 납부금액의 40%</p>
                  </div>
                  <p>3. 회원권의 양도는 회사의 승인 하에 가능하며, 별도의 양도 수수료가 발생할 수 있습니다.</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">제8조 (회사의 책임)</h3>
                <div className="space-y-2 text-gray-700">
                  <p>1. 회사는 안전한 운동환경을 제공하기 위해 최선을 다합니다.</p>
                  <p>2. 시설 및 기구의 정기점검을 실시하여 안전사고를 예방합니다.</p>
                  <p>3. 회사의 고의 또는 중과실로 인한 손해에 대해서는 책임을 집니다.</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">제9조 (면책조항)</h3>
                <div className="space-y-2 text-gray-700">
                  <p>1. 회원의 부주의나 과실로 인한 사고에 대해서는 회사가 책임지지 않습니다.</p>
                  <p>2. 회원의 개인 소지품 분실에 대해서는 회사가 책임지지 않습니다.</p>
                  <p>3. 천재지변 등 불가항력적인 사유로 인한 서비스 중단 시 책임을 지지 않습니다.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 text-sm leading-relaxed">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">개인정보 수집 및 이용 동의</h3>
                <p className="text-gray-700">
                  Jamaica Fitness는 개인정보보호법에 따라 회원의 개인정보를 안전하게 처리하고 있습니다.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">1. 개인정보 수집 목적</h3>
                <div className="space-y-2 text-gray-700">
                  <p>- 회원 식별 및 회원제 서비스 제공</p>
                  <p>- 헬스장 이용 관리 및 계약 이행</p>
                  <p>- 이용료 결제 및 정산</p>
                  <p>- 고객 상담 및 민원 처리</p>
                  <p>- 서비스 개선 및 신규 서비스 개발</p>
                  <p>- 법령상 의무 이행</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">2. 수집하는 개인정보 항목</h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>[필수항목]</strong></p>
                  <p>- 성명, 전화번호, 서명정보</p>
                  <p>- 회원권 종류 및 이용 기간</p>
                  <p>- 결제 정보 (결제 방법, 결제 일시)</p>
                  <br />
                  <p><strong>[선택항목]</strong></p>
                  <p>- 이메일 주소</p>
                  <p>- 생년월일, 성별</p>
                  <p>- 긴급연락처</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">3. 개인정보 보유 및 이용기간</h3>
                <div className="space-y-2 text-gray-700">
                  <p>- 회원 탈퇴 시까지 (단, 법령에 따른 보존의무가 있는 경우 예외)</p>
                  <p>- 계약서류: 계약 종료 후 3년</p>
                  <p>- 결제기록: 5년</p>
                  <p>- 웹사이트 방문기록: 3개월</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">4. 개인정보 제3자 제공</h3>
                <div className="space-y-2 text-gray-700">
                  <p>회사는 원칙적으로 회원의 개인정보를 외부에 제공하지 않습니다.</p>
                  <p>단, 다음의 경우에는 예외로 합니다:</p>
                  <p>- 회원이 사전에 동의한 경우</p>
                  <p>- 법령의 규정에 의한 경우</p>
                  <p>- 수사기관의 요구가 있는 경우</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">5. 개인정보 처리 위탁</h3>
                <div className="space-y-2 text-gray-700">
                  <p>회사는 서비스 향상을 위해 개인정보 처리를 위탁할 수 있으며, 위탁 시 관련 법령에 따라 적절히 관리합니다.</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">6. 회원의 권리</h3>
                <div className="space-y-2 text-gray-700">
                  <p>회원은 다음과 같은 권리를 가집니다:</p>
                  <p>- 개인정보 처리 현황 통지 요구</p>
                  <p>- 개인정보 열람 요구</p>
                  <p>- 개인정보 정정·삭제 요구</p>
                  <p>- 개인정보 처리 정지 요구</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">7. 개인정보보호책임자</h3>
                <div className="space-y-2 text-gray-700">
                  <p>Jamaica Fitness 개인정보보호책임자</p>
                  <p>연락처: 02-1234-5678</p>
                  <p>이메일: privacy@jamaicafitness.com</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => {
              onAgree();
              onClose();
            }}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            동의하고 계속하기
          </button>
        </div>
      </div>
    </div>
  );
}