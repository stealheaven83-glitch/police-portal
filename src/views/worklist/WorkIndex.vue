<template>
  <div class="worklist-container">
    <header class="worklist-header">
      <h2>스마트워크 퍼블리싱 워크리스트</h2>
      <!-- <div class="summary-box">
        <span>전체: <strong>{{ worklist.length }}</strong>건</span>
        <span>완료: <strong>{{ countByStatus('완료') }}</strong>건</span>
        <span>진행중: <strong>{{ countByStatus('진행중') }}</strong>건</span>
        <span>대기: <strong>{{ countByStatus('대기') }}</strong>건</span>
        <span>진척률: <strong>{{ progressRate }}%</strong></span>
      </div> -->
    </header>

    <!-- 검색 및 필터 컨트롤 -->
    <div class="control-panel">
      <div class="filter-group">
        <label>구분 필터:</label>
        <select v-model="selectedCategory">
          <option value="">전체 구분</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>

        <label>상태 필터:</label>
        <select v-model="selectedStatus">
          <option value="">전체 상태</option>
          <!-- <option value="대기">대기</option> -->
          <!-- <option value="진행중">진행중</option>
          <option value="검수">검수</option> -->
          <option value="완료">완료</option>
        </select>
      </div>

      <div class="search-group">
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="화면ID, 화면명, Depth 검색" 
        />
        <button v-if="searchKeyword" @click="searchKeyword = ''">초기화</button>
      </div>
    </div>

    <!-- 워크리스트 테이블 -->
    <div class="table-wrapper">
      <table class="worklist-table">
        <thead>
          <tr>
            <th style="width: 50px;">No</th>
            <th style="width: 100px;">구분</th>
            <th style="width: 120px;">1Depth</th>
            <th style="width: 140px;">2Depth</th>
            <th style="width: 150px;">3Depth</th>
            <th style="width: 160px;">4Depth</th>
            <th style="width: 160px;">5Depth</th>
            <th>화면명</th>
            <th style="width: 140px;">화면ID</th>
            <th style="width: 100px;">상태</th>
            <th style="width: 100px;">링크</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in filteredList" :key="item.id" :class="{ 'has-path': item.path }">
            <td class="text-center">{{ index + 1 }}</td>
            <td class="text-center">{{ item.category }}</td>
            <td>{{ item.depth1 }}</td>
            <td>{{ item.depth2 }}</td>
            <td>{{ item.depth3 }}</td>
            <td>{{ item.depth4 }}</td>
            <td>{{ item.depth5 }}</td>
            <td class="font-bold">{{ item.screenName }}</td>
            <td class="text-center font-code">{{ item.screenId }}</td>
            <td class="text-center">
              <select v-model="item.status" :class="`status-${item.status}`">
                <option value="대기"></option>
                <option value="진행중">진행중</option>
                <option value="검수">검수</option>
                <option value="완료">완료</option>
              </select>
            </td>
            <td class="text-center">
              <button 
                class="btn-preview" 
                :disabled="!item.path"
                @click="goToPage(item.path)"
              >
                열기
              </button>
            </td>
          </tr>
          <tr v-if="filteredList.length === 0">
            <td colspan="11" class="no-data">일치하는 화면 정보가 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const selectedCategory = ref('')
const selectedStatus = ref('')
const searchKeyword = ref('')

// IA 기반 전체 데이터 목록 (393건)
const worklist = ref([
  { id: 1, category: '스마트워크', depth1: '지역경찰', depth2: '', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 2, category: '스마트워크', depth1: '', depth2: '개인수첩', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 3, category: '스마트워크', depth1: '', depth2: '', depth3: '메모', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 4, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록', depth5: '', screenName: '개인수첩 화면', screenId: 'PM-LPO-0101', path: '', status: '대기' },
  { id: 5, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '상세/수정', depth5: '', screenName: '상세/수정화면', screenId: 'PM-LPO-0102', path: '', status: '대기' },
  { id: 6, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '대기시간 초과 팝업', screenName: '대기시간 초과 팝업창', screenId: 'MO-LPO-0103', path: '', status: '대기' },
  { id: 7, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '등록', depth5: '', screenName: '등록화면', screenId: 'PM-LPO-0104', path: '', status: '대기' },
  { id: 8, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '음성인식 종료 팝업', screenName: '음성인식 종료 팝업창', screenId: 'MO-LPO-0105', path: '', status: '대기' },
  { id: 9, category: '스마트워크', depth1: '', depth2: '', depth3: '알림', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 10, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록', depth5: '', screenName: '알림메시지 목록 화면', screenId: 'PM-LPO-0106', path: '', status: '대기' },
  { id: 11, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '알림상세', depth5: '', screenName: '알림메세지 상세 팝업', screenId: 'PM-LPO-0107', path: '', status: '대기' },
  { id: 12, category: '스마트워크', depth1: '', depth2: '', depth3: '근무일정조회', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 13, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록', depth5: '', screenName: '근무일정 목록 화면', screenId: 'PM-LPO-0108', path: '', status: '대기' },
  { id: 14, category: '스마트워크', depth1: '', depth2: '', depth3: '출동수동', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 15, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록', depth5: '', screenName: '출동수당 목록 화면', screenId: 'PM-LPO-0109', path: '', status: '대기' },
  { id: 16, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '출동사건정보', depth5: '', screenName: '출동사건정보 팝업화면', screenId: 'PM-LPO-0110', path: '', status: '대기' },
  { id: 17, category: '스마트워크', depth1: '', depth2: '', depth3: '개인실적조회', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 18, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록', depth5: '', screenName: '개인실적조회 화면', screenId: 'PC-LPO-0111', path: '', status: '대기' },
  { id: 19, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '112신고처리', depth5: '', screenName: '112신고처리 실적화면', screenId: 'MO-LPO-0112', path: '', status: '대기' },
  { id: 20, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '즉결심판', depth5: '', screenName: '즉결심판 실적화면', screenId: 'MO-LPO-0113', path: '', status: '대기' },
  { id: 21, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '통고처분', depth5: '', screenName: '통고처분 실적화면', screenId: 'MO-LPO-0114', path: '', status: '대기' },
  { id: 22, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: 'TCS단속', depth5: '', screenName: 'TCS단속 실적화면', screenId: 'MO-LPO-0115', path: '', status: '대기' },
  { id: 23, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '차량순찰', depth5: '', screenName: '차량순찰 실적화면', screenId: 'MO-LPO-0116', path: '', status: '대기' },
  { id: 24, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '도보순찰', depth5: '', screenName: '도보순찰 실적화면', screenId: 'MO-LPO-0117', path: '', status: '대기' },
  { id: 25, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '거점순찰', depth5: '', screenName: '거점순찰 실적화면', screenId: 'MO-LPO-0118', path: '', status: '대기' },
  { id: 26, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '범죄예방진단', depth5: '', screenName: '범죄예방진단 실적화면', screenId: 'MO-LPO-0119', path: '', status: '대기' },
  { id: 27, category: '스마트워크', depth1: '', depth2: '', depth3: '결재함', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 28, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록(결재요청자)', depth5: '', screenName: '결제함(결재요청자) 목록화면', screenId: 'PM-LPO-0120', path: '', status: '대기' },
  { id: 29, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록(결재승인자)', depth5: '', screenName: '결제함(결재승인자) 목록화면', screenId: 'PM-LPO-0121', path: '', status: '대기' },
  { id: 30, category: '스마트워크', depth1: '', depth2: '', depth3: '화면설정', depth4: '', depth5: '', screenName: '메인화면 설정 화면', screenId: 'PM-LPO-0122', path: '', status: '대기' },
  { id: 31, category: '스마트워크', depth1: '', depth2: '', depth3: '블루투스', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 32, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록', depth5: '', screenName: '블루투스 연결 목록 및 프린터 테스트 인쇄 화면', screenId: 'MO-LPO-0123', path: '', status: '대기' },
  { id: 33, category: '스마트워크', depth1: '', depth2: '근무일지', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 34, category: '스마트워크', depth1: '', depth2: '', depth3: '근무일지(甲)', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 35, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '근무지정표작성', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 36, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '근무지정표', screenName: '근무지정표 화면', screenId: 'PC-LPO-0202', path: '', status: '대기' },
  { id: 37, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '근무자 추가관리', screenName: '근무자 추가관리 팝업', screenId: 'PC-LPO-0204', path: '', status: '대기' },
  { id: 38, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '자원근무자 관리', screenName: '자원근무자 팝업창', screenId: 'PC-LPO-0205', path: '', status: '대기' },
  { id: 39, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '사고자 관리', screenName: '사고자 팝업창', screenId: 'PC-LPO-0206', path: '', status: '대기' },
  { id: 40, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '근무관리', screenName: '근무관리 팝업창', screenId: 'PC-LPO-0207', path: '', status: '대기' },
  { id: 41, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '시간관리', screenName: '시간관리 팝업창', screenId: 'PC-LPO-0208', path: '', status: '대기' },
  { id: 42, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '순찰구역', screenName: '순찰구역 관리 화면', screenId: 'PC-LPO-0209', path: '', status: '대기' },
  { id: 43, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '순찰구역 상세', screenName: '순찰구역 상세 팝업창', screenId: 'PC-LPO-0210', path: '', status: '대기' },
  { id: 44, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '甲지 일괄출력', screenName: '갑지 일괄출력 팝업창', screenId: 'PC-LPO-0211', path: '', status: '대기' },
  { id: 45, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '근무 사용자 선택', screenName: '근무 사용자 선택 팝업창', screenId: 'PC-LPO-0212', path: '', status: '대기' },
  { id: 46, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '중점사항 입력', screenName: '중점사항 입력 팝업창', screenId: 'PC-LPO-0213', path: '', status: '대기' },
  { id: 47, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '기본주기설정', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 48, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '목록', screenName: '기본주기 목록화면', screenId: 'PC-LPO-0214', path: '', status: '대기' },
  { id: 49, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '근무현황', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 50, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '목록', screenName: '근무현황 목록 화면', screenId: 'PC-LPO-0216', path: '', status: '대기' },
  { id: 51, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '사고신청', screenName: '사고신청 팝업창', screenId: 'PC-LPO-0225', path: '', status: '대기' },
  { id: 52, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '자원근무신청', screenName: '자원근무 신청 팝업창', screenId: 'PC-LPO-0226', path: '', status: '대기' },
  { id: 53, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '사고자/자원근무자 현황', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 54, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '목록', screenName: '사고자/자원근무자 현황 화면', screenId: 'PC-LPO-0215', path: '', status: '대기' },
  { id: 55, category: '스마트워크', depth1: '', depth2: '', depth3: '근무일지(乙)', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 56, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '근무일지(乙) 등록', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 57, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '목록', screenName: '근무일지(乙) 등록 리스트 화면', screenId: 'PM-LPO-0217', path: '', status: '대기' },
  { id: 58, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '등록', screenName: '근무일지(乙) 등록 화면', screenId: 'MO-LPO-0218', path: '', status: '대기' },
  { id: 59, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '112누락정보', screenName: '112누락정보 팝업창', screenId: 'PM-LPO-0219', path: '', status: '대기' },
  { id: 60, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '112신고', screenName: '112신고 내역 상세 팝업창', screenId: 'PM-LPO-0220', path: '', status: '대기' },
  { id: 61, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '처리자 관리', screenName: '처리자 관리 팝업창', screenId: 'PM-LPO-0221', path: '', status: '대기' },
  { id: 62, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '파일업로드', screenName: '파일 업로드 팝업창', screenId: 'PM-LPO-0222', path: '', status: '대기' },
  { id: 63, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '근무일지(乙) 조회', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 64, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '목록', screenName: '근무일지(乙) 조회 화면', screenId: 'PM-LPO-0223', path: '', status: '대기' },
  { id: 65, category: '스마트워크', depth1: '', depth2: '인수인계', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 66, category: '스마트워크', depth1: '', depth2: '', depth3: '인수인계 작성', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 67, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '상세내역', depth5: '', screenName: '인수인계 화면', screenId: 'PC-LPO-0301', path: '', status: '대기' },
  { id: 68, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '인쇄', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 69, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '저장', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 70, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '인계저장(인계자)', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 71, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '인수관 확인(인수자)', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 72, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '확인관 확인(확인자)', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 73, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '점검관 확인(점검자)', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 74, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '인수인계 취소', screenName: '인수인계 취소 팝업창', screenId: 'PC-LPO-0302', path: '', status: '대기' },
  { id: 75, category: '스마트워크', depth1: '', depth2: '', depth3: '월별 인수인계 현황', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 76, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록', depth5: '', screenName: '월별 인수인계 현황 화면', screenId: 'PC-LPO-0304', path: '', status: '대기' },
  { id: 77, category: '스마트워크', depth1: '', depth2: '현장업무', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 78, category: '스마트워크', depth1: '', depth2: '', depth3: '현장서류 목록', depth4: '', depth5: '', screenName: '현장서류 목록 화면', screenId: 'MO-LPO-0401', path: '', status: '대기' },
  { id: 79, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '지명통보 사실 통지서', depth5: '', screenName: '지명통보 사실 통지서 화면', screenId: 'MO-LPO-0402', path: '', status: '대기' },
  { id: 80, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '실종/가출 소재발견 기초질문지', depth5: '', screenName: '실종/가출 소재발견 기초질문지 화면', screenId: 'MO-LPO-0403', path: '', status: '대기' },
  { id: 81, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '스토킹/교제폭력 경고장', depth5: '', screenName: '스토킹/교제폭력 경고장 화면', screenId: 'MO-LPO-0404', path: '', status: '대기' },
  { id: 82, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '스토킹/교제폭력 피해자 안내서', depth5: '', screenName: '스토킹/교제폭력 피해자 안내서 화면', screenId: 'MO-LPO-0405', path: '', status: '대기' },
  { id: 83, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '긴급응급조치 통지서', depth5: '', screenName: '긴급응급조치 통지서 화면', screenId: 'MO-LPO-0406', path: '', status: '대기' },
  { id: 84, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '정신질환자 응급입원 판단 매뉴얼', depth5: '', screenName: '정신질환자 응급입원 판단 매뉴얼 화면', screenId: 'MO-LPO-0407', path: '', status: '대기' },
  { id: 85, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '피구호자 인계서', depth5: '', screenName: '피구호자 인계서 화면', screenId: 'MO-LPO-0408', path: '', status: '대기' },
  { id: 86, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '통합판단조사표', depth5: '', screenName: '통합판단조사표 바로가기', screenId: '', path: '', status: '대기' },
  { id: 87, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '아동폭력', depth5: '', screenName: '아동폭력 바로가기', screenId: '', path: '', status: '대기' },
  { id: 88, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '사실혼판단체크리스트', depth5: '', screenName: '사실혼판단체크리스트 화면', screenId: '', path: '', status: '대기' },
  { id: 89, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '성폭력 피해자 안내서', depth5: '', screenName: '성폭력 피해자 안내서 화면', screenId: 'MO-LPO-0410', path: '', status: '대기' },
  { id: 90, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '범죄피해자 안내서', depth5: '', screenName: '범죄피해자 안내서 화면', screenId: 'MO-LPO-0411', path: '', status: '대기' },
  { id: 91, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '참고 체크리스트', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 92, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '목록', screenName: '참고 체크리스트 화면', screenId: 'MO-LPO-0412', path: '', status: '대기' },
  { id: 93, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '가정폭력 경고장', screenName: '가정폭력 경고장 화면', screenId: 'MO-LPO-0414', path: '', status: '대기' },
  { id: 94, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '전화금융사기체크리스트', screenName: '전화금융사기체크리스트 화면', screenId: 'MO-LPO-0415', path: '', status: '대기' },
  { id: 95, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '디지털성범죄 피해자 인도 체크리스트', screenName: '디지털성범죄 피해자 인도 체크리스트 화면', screenId: 'MO-LPO-0416', path: '', status: '대기' },
  { id: 96, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '자살시도자 현장 대화법', screenName: '자살시도자 현장 대화법 화면', screenId: 'MO-LPO-0417', path: '', status: '대기' },
  { id: 97, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '현장경찰을 위한 신종 범죄 대응 설명자료', screenName: '현장경찰을 위한 신종 범죄 대응 설명자료 화면', screenId: 'MO-LPO-0418', path: '', status: '대기' },
  { id: 98, category: '스마트워크', depth1: '', depth2: '', depth3: '정신질환 보호관찰 종료자', depth4: '', depth5: '', screenName: '정신질환 보호관찰 종료자 화면', screenId: 'MO-LPO-0419', path: '', status: '대기' },
  { id: 99, category: '스마트워크', depth1: '', depth2: '', depth3: '지문 신원확인', depth4: '', depth5: '', screenName: '지문 신원확인 화면', screenId: 'MO-LPO-0420', path: '', status: '대기' },
  { id: 100, category: '스마트워크', depth1: '', depth2: '출동수당', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 101, category: '스마트워크', depth1: '', depth2: '', depth3: '출동수당 조회', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 102, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록', depth5: '', screenName: '출동수당 조회 화면', screenId: 'PC-LPO-0501', path: '', status: '대기' },
  { id: 103, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '임의등록', depth5: '', screenName: '임의등록 팝업창', screenId: 'PC-LPO-0502', path: '', status: '대기' },
  { id: 104, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '112신고조회', depth5: '', screenName: '112신고조회 팝업', screenId: 'PC-LPO-0503', path: '', status: '대기' },
  { id: 105, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '출동사건상세', depth5: '', screenName: '출동사건상세 팝업창', screenId: 'PC-LPO-0504', path: '', status: '대기' },
  { id: 106, category: '스마트워크', depth1: '', depth2: '', depth3: '출동수당 취합(월별)', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 107, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록', depth5: '', screenName: '출동수당 취합 월별 화면', screenId: 'PC-LPO-0505', path: '', status: '대기' },
  { id: 108, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '승인관리', depth5: '', screenName: '승인관리 팝업 화면', screenId: 'PC-LPO-0506', path: '', status: '대기' },
  { id: 109, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '사용자찾기', depth5: '', screenName: '사용자 찾기 팝업화면', screenId: 'PC-LPO-0507', path: '', status: '대기' },
  { id: 110, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '승인취소관리', depth5: '', screenName: '승인취소관리 팝업화면', screenId: 'PC-LPO-0508', path: '', status: '대기' },
  { id: 111, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '타직원 출동수당 신청', depth5: '', screenName: '타직원 출동수당 신청 팝업 화면', screenId: 'PC-LPO-0509', path: '', status: '대기' },
  { id: 112, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '출동사건정보', depth5: '', screenName: '출동사건정보 팝업화면', screenId: 'PC-LPO-0510', path: '', status: '대기' },
  { id: 113, category: '스마트워크', depth1: '', depth2: '', depth3: '출동수당 취합(일별)', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 114, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록', depth5: '', screenName: '출동수당 취합 일별 화면', screenId: 'PC-LPO-0511', path: '', status: '대기' },
  { id: 115, category: '스마트워크', depth1: '', depth2: '', depth3: '출동수당통보', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 116, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록', depth5: '', screenName: '출동수당통보 화면', screenId: 'PC-LPO-0512', path: '', status: '대기' },
  { id: 117, category: '스마트워크', depth1: '', depth2: '관내현황', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 118, category: '스마트워크', depth1: '', depth2: '', depth3: '상세내역', depth4: '', depth5: '', screenName: '관내현황 상세내역', screenId: 'PC-LPO-0601', path: '', status: '대기' },
  { id: 119, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '순찰차별 순찰구역', depth5: '', screenName: '순찰차별 상세구역 팝업창', screenId: 'PC-LPO-0602', path: '', status: '대기' },
  { id: 120, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '행정동검색', depth5: '', screenName: '행정동 검색 팝업창', screenId: 'PC-LPO-0603', path: '', status: '대기' },
  { id: 121, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '순찰구역 상세', depth5: '', screenName: '순찰구역 상세 팝업창', screenId: 'PC-LPO-0604', path: '', status: '대기' },
  { id: 122, category: '스마트워크', depth1: '', depth2: '장비관리', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 123, category: '스마트워크', depth1: '', depth2: '', depth3: '기동장비 탭', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 124, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록', depth5: '', screenName: '기동장비 목록', screenId: 'PC-LPO-0701', path: '/views/lpo/PC-LPO-0701', status: '대기' },
  { id: 125, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '등록/상세/수정', depth5: '', screenName: '기동장비 등록/상세/수정 팝업창', screenId: 'PC-LPO-0702', path: '/views/lpo/PC-LPO-0702', status: '대기' },
  { id: 126, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '112차량 조회', screenName: '112차량 조회 팝업창', screenId: 'PC-LPO-0703', path: '/views/lpo/PC-LPO-0703', status: '대기' },
  { id: 127, category: '스마트워크', depth1: '', depth2: '', depth3: '통신장비 탭', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 128, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록', depth5: '', screenName: '통신장비 목록', screenId: 'PC-LPO-0704', path: '/views/lpo/PC-LPO-0704', status: '대기' },
  { id: 129, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '등록/상세/수정', depth5: '', screenName: '통신장비 등록/상세/수정 팝업창', screenId: 'PC-LPO-0705', path: '/views/lpo/PC-LPO-0705', status: '대기' },
  { id: 130, category: '스마트워크', depth1: '', depth2: '', depth3: '무기 탭', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 131, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록', depth5: '', screenName: '무기목록', screenId: 'PC-LPO-0706', path: '/views/lpo/PC-LPO-0706', status: '대기' },
  { id: 132, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '등록/상세/수정', depth5: '', screenName: '무기 등록/상세/수정 팝업창', screenId: 'PC-LPO-0707', path: '/views/lpo/PC-LPO-0707', status: '대기' },
  { id: 133, category: '스마트워크', depth1: '', depth2: '', depth3: '탄약 탭', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 134, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록', depth5: '', screenName: '탄약 목록', screenId: 'PC-LPO-0708', path: '/views/lpo/PC-LPO-0708', status: '대기' },
  { id: 135, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '등록/상세/수정', depth5: '', screenName: '탄약 등록/상세/수정 팝업창', screenId: 'PC-LPO-0709', path: '/views/lpo/PC-LPO-0709', status: '대기' },
  { id: 136, category: '스마트워크', depth1: '', depth2: '', depth3: '수갑 탭', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 137, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록', depth5: '', screenName: '수갑 목록', screenId: 'PC-LPO-0710', path: '/views/lpo/PC-LPO-0710', status: '대기' },
  { id: 138, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '등록/상세/수정', depth5: '', screenName: '수갑 등록/상세/수정 팝업창', screenId: 'PC-LPO-0711', path: '/views/lpo/PC-LPO-0711', status: '대기' },
  { id: 139, category: '스마트워크', depth1: '', depth2: '', depth3: '기타 탭', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 140, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록', depth5: '', screenName: '기타 목록', screenId: 'PC-LPO-0712', path: '/views/lpo/PC-LPO-0712', status: '대기' },
  { id: 141, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '등록/상세/수정', depth5: '', screenName: '기타 등록/상세/수정 팝업창', screenId: 'PC-LPO-0713', path: '/views/lpo/PC-LPO-0713', status: '대기' },
  { id: 142, category: '스마트워크', depth1: '', depth2: '', depth3: '장비 유지보수 이력', depth4: '', depth5: '', screenName: '장비 유지보수 이력 팝업창', screenId: 'PC-LPO-0714', path: '/views/lpo/PC-LPO-0714', status: '대기' },
  { id: 143, category: '스마트워크', depth1: '', depth2: '인사관리', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 144, category: '스마트워크', depth1: '', depth2: '', depth3: '상세내역', depth4: '', depth5: '', screenName: '인사관리 화면', screenId: 'PC-LPO-0801', path: '', status: '대기' },
  { id: 145, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '부서 찾기', depth5: '', screenName: '전/출입 부서찾기 팝업창', screenId: 'PC-LPO-0802', path: '', status: '대기' },
  { id: 146, category: '스마트워크', depth1: '', depth2: '지역경찰 기초정보 관리', depth3: '', depth4: '', depth5: '', screenName: '지역경찰 통계관리 화면', screenId: '', path: '', status: '대기' },
  { id: 147, category: '스마트워크', depth1: '', depth2: '', depth3: '목록', depth4: '', depth5: '', screenName: '기초통계 목록', screenId: 'PC-LPO-0901', path: '', status: '대기' },
  { id: 148, category: '스마트워크', depth1: '', depth2: '', depth3: '상세', depth4: '', depth5: '', screenName: '기초통계 상세', screenId: 'PC-LPO-0902', path: '', status: '대기' },
  { id: 149, category: '스마트워크', depth1: '', depth2: '', depth3: '등록', depth4: '', depth5: '', screenName: '기초통계 엑셀 업로드', screenId: 'PC-LPO-0903', path: '', status: '대기' },
  { id: 150, category: '스마트워크', depth1: '생활안전', depth2: '', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 151, category: '스마트워크', depth1: '', depth2: '범죄예방진단', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 152, category: '스마트워크', depth1: '', depth2: '', depth3: '간이 범죄예방진단', depth4: '목록', depth5: '', screenName: '간이 범죄예방진단 목록', screenId: 'PM-PUB-0101', path: '/views/PUB/PM-PUB-0101', status: '대기' },
  { id: 153, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '상세', depth5: '', screenName: '간이 범죄예방진단 상세', screenId: 'PM-PUB-0102', path: '', status: '대기' },
  { id: 154, category: '스마트워크', depth1: '', depth2: '', depth3: 'CPO 입력·관리', depth4: '목록', depth5: '', screenName: 'CPO 입력관리 목록', screenId: 'PM-PUB-0103', path: '', status: '대기' },
  { id: 155, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '범죄예방진단결과(보관용)', screenName: '범죄예방진단결과(보관용)', screenId: 'PM-PUB-0104', path: '', status: '대기' },
  { id: 156, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '범죄예방진단결과(CPO확인용)', screenName: '범죄예방진단결과(CPO확인용)', screenId: 'PM-PUB-0105', path: '', status: '대기' },
  { id: 157, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '진단추가', screenName: '진단추가', screenId: 'PM-PUB-0106', path: '', status: '대기' },
  { id: 158, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '신규(등록)', depth5: '', screenName: '진단신규(등록)', screenId: 'PM-PUB-0107', path: '', status: '대기' },
  { id: 159, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '상세', depth5: '', screenName: '범죄예방진단 상세', screenId: 'PM-PUB-0108', path: '', status: '대기' },
  { id: 160, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '사진자료', screenName: '사진자료', screenId: 'PM-PUB-0109', path: '', status: '대기' },
  { id: 161, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '간이진단통보자료', screenName: '간이진단통보자료', screenId: 'PM-PUB-0110', path: '', status: '대기' },
  { id: 162, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '이력보기', screenName: '이력보기', screenId: 'PM-PUB-0111', path: '', status: '대기' },
  { id: 163, category: '스마트워크', depth1: '', depth2: '', depth3: '참고사항', depth4: '상세', depth5: '', screenName: '참고사항 상세', screenId: 'PM-PUB-0112', path: '', status: '대기' },
  { id: 164, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '업로드', depth5: '', screenName: '참고사항 업로드', screenId: 'PM-PUB-0113', path: '', status: '대기' },
  { id: 165, category: '스마트워크', depth1: '', depth2: '', depth3: '우수시설인증', depth4: '리스트', depth5: '', screenName: '진단인증 리스트', screenId: 'PM-PUB-0114', path: '', status: '대기' },
  { id: 166, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '체크리스트', depth5: '', screenName: '진단인증 체크리스트', screenId: 'PM-PUB-0115', path: '', status: '대기' },
  { id: 167, category: '스마트워크', depth1: '', depth2: '', depth3: 'Pre-CAS', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 168, category: '스마트워크', depth1: '', depth2: '여성청소년', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 169, category: '스마트워크', depth1: '', depth2: '', depth3: '통합판단조사표', depth4: '통합판단조사표 목록', depth5: '', screenName: '통합판단조사표 목록', screenId: 'PM-PUB-0201', path: '', status: '대기' },
  { id: 170, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '미도착/미종결 목록', depth5: '112신고조회', screenName: '미도착/미종결 목록', screenId: 'PM-PUB-0202', path: '', status: '대기' },
  { id: 171, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '통합판단조사표 수정', depth5: '미도착/미종결 목록', screenName: '통합판단조사표 수정', screenId: 'PM-PUB-0203', path: '', status: '대기' },
  { id: 172, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '통합판단조사표 등록', depth5: '수정', screenName: '통합판단조사표 등록', screenId: 'PM-PUB-0204', path: '', status: '대기' },
  { id: 173, category: '스마트워크', depth1: '', depth2: '', depth3: '아동학대', depth4: '아동학대 목록', depth5: '등록', screenName: '아동학대 목록', screenId: 'PM-PUB-0205', path: '', status: '대기' },
  { id: 174, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '아동학대 수정', depth5: '', screenName: '아동학대 수정', screenId: 'PM-PUB-0206', path: '', status: '대기' },
  { id: 175, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '아동학대 등록', depth5: '', screenName: '아동학대 등록', screenId: 'PM-PUB-0207', path: '', status: '대기' },
  { id: 176, category: '스마트워크', depth1: '', depth2: '', depth3: '맞춤형 순찰 현황', depth4: '', depth5: '', screenName: '맞춤형 순찰 현황', screenId: '', path: '', status: '대기' },
  { id: 177, category: '스마트워크', depth1: '', depth2: '', depth3: '(구)자료조회', depth4: '가정폭력 목록/상세', depth5: '', screenName: '가정폭력 목록/상세', screenId: 'PC-PUB-0208', path: '', status: '대기' },
  { id: 178, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '아동학대 목록/상세', depth5: '', screenName: '아동학대 목록/상세', screenId: 'PC-PUB-0209', path: '', status: '대기' },
  { id: 179, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '스토킹 목록/상세', depth5: '', screenName: '스토킹 목록/상세', screenId: 'PC-PUB-0210', path: '', status: '대기' },
  { id: 180, category: '스마트워크', depth1: '', depth2: '방범협력단체', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 181, category: '스마트워크', depth1: '', depth2: '', depth3: '단체정보리스트', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 182, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록', depth5: '', screenName: '단체정보 목록', screenId: 'PC-PUB-0301', path: '', status: '대기' },
  { id: 183, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '상세/수정', depth5: '', screenName: '단체정보 상세/수정', screenId: 'PC-PUB-0302', path: '', status: '대기' },
  { id: 184, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '등록', depth5: '', screenName: '단체정보 등록', screenId: 'PM-PUB-0303', path: '', status: '대기' },
  { id: 185, category: '스마트워크', depth1: '', depth2: '', depth3: '단체활동기록', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 186, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록/상세/수정/등록', depth5: '', screenName: '단체활동기록 목록/상세/수정/등록', screenId: 'PM-PUB-0304', path: '', status: '대기' },
  { id: 187, category: '스마트워크', depth1: '', depth2: '', depth3: '단체현황', depth4: '', depth5: '', screenName: '단체현황', screenId: 'PC-PUB-0305', path: '', status: '대기' },
  { id: 188, category: '스마트워크', depth1: '', depth2: '', depth3: '활동현황', depth4: '', depth5: '', screenName: '활동현황', screenId: "P'C-PUB-0306", path: '', status: '대기' },
  { id: 189, category: '스마트워크', depth1: '', depth2: '해바라기센터', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 190, category: '스마트워크', depth1: '', depth2: '', depth3: '해바라기센터 관리', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 191, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록', depth5: '', screenName: '해바라기센터 목록', screenId: 'PM-PUB-0401', path: '', status: '대기' },
  { id: 192, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '상세', depth5: '', screenName: '해바라기센터 상세', screenId: 'PM-PUB-0402', path: '', status: '대기' },
  { id: 193, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '등록', depth5: '', screenName: '해바라기센터 등록', screenId: 'PM-PUB-0403', path: '', status: '대기' },
  { id: 194, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '센터 사용자', depth5: '', screenName: '해바라기센터 사용자', screenId: 'PM-PUB-0404', path: '', status: '대기' },
  { id: 195, category: '스마트워크', depth1: '', depth2: '', depth3: '조사예약', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 196, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록(월별)', depth5: '', screenName: '조사예약 목록(월별)', screenId: 'PM-PUB-0405', path: '', status: '대기' },
  { id: 197, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록(주간별)', depth5: '', screenName: '조사예약 목록(주간별)', screenId: 'PM-PUB-0406', path: '', status: '대기' },
  { id: 198, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '상세', depth5: '', screenName: '조사예약 상세', screenId: 'PM-PUB-0407', path: '', status: '대기' },
  { id: 199, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '등록', depth5: '', screenName: '조사예약 등록', screenId: 'PM-PUB-0408', path: '', status: '대기' },
  { id: 200, category: '스마트워크', depth1: '', depth2: '보호조치 대응팀', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 201, category: '스마트워크', depth1: '', depth2: '', depth3: '주취자 센터 병상 현황', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 202, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '주취자센터병상현황 목록/상세', depth5: '', screenName: '주취자센터병상현황 목록/상세', screenId: 'PM-PUB-0409', path: '', status: '대기' },
  { id: 203, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '주취자센터병상현황 상세', depth5: '', screenName: '주취자센터병상현황 상세(모바일)', screenId: 'MO-PUB-0416', path: '', status: '대기' },
  { id: 204, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '주취자등록&병상배정 등록', depth5: '', screenName: '주취자등록&병상배정 등록', screenId: 'PC-PUB-0410', path: '', status: '대기' },
  { id: 205, category: '스마트워크', depth1: '', depth2: '', depth3: '주취자 센터관리', depth4: '주취자센터 목록', depth5: '', screenName: '주취자센터 목록', screenId: 'PM-PUB-0411', path: '', status: '대기' },
  { id: 206, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '주취자센터 등록', depth5: '', screenName: '주취자센터 등록', screenId: 'PC-PUB-0412', path: '', status: '대기' },
  { id: 207, category: '스마트워크', depth1: '', depth2: '', depth3: '주취자입퇴소현황', depth4: '', depth5: '', screenName: '주취자입퇴소현황', screenId: 'PC-PUB-0413', path: '', status: '대기' },
  { id: 208, category: '스마트워크', depth1: '', depth2: '', depth3: '정신 응급 대응팀', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 209, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록', depth5: '', screenName: '정신응급대응팀 목록', screenId: 'PM-PUB-0414', path: '', status: '대기' },
  { id: 210, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '등록', depth5: '', screenName: '정신응급대응팀 등록', screenId: 'PC-PUB-0415', path: '', status: '대기' },
  { id: 211, category: '스마트워크', depth1: '', depth2: '폴케어', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 212, category: '스마트워크', depth1: '', depth2: '', depth3: '목록', depth4: '', depth5: '', screenName: '폴케어 목록화면', screenId: 'MO-PUB-0501', path: '', status: '대기' },
  { id: 213, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '지원제도 안내', depth5: '', screenName: '지원제도 안내 화면', screenId: '', path: '', status: '대기' },
  { id: 214, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '형사절차와 나의 권리', depth5: '', screenName: '형사절차와 나의 권리 화면', screenId: '', path: '', status: '대기' },
  { id: 215, category: '스마트워크', depth1: '', depth2: '조회', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 216, category: '스마트워크', depth1: '', depth2: '', depth3: '목록', depth4: '', depth5: '', screenName: '조회 목록 화면', screenId: 'MO-PUB-0601', path: '', status: '대기' },
  { id: 217, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '사회적약자보호 종합플랫폼', depth5: '', screenName: '사회적약자보호 종합플랫폼', screenId: '', path: '', status: '대기' },
  { id: 218, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '폴리폰', depth5: '', screenName: '폴리폰', screenId: '', path: '', status: '대기' },
  { id: 219, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '미성년자 조회', depth5: '', screenName: '미성년자 조회', screenId: 'MO-PUB-0602', path: '', status: '대기' },
  { id: 220, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '생년월일 선택', screenName: '생년월일 선택 팝업창', screenId: 'MO-PUB-0601', path: '', status: '대기' },
  { id: 221, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '미성년자 조회 결과', depth5: '', screenName: '미성년자 조회 결과 화면', screenId: 'MO-PUB-0601', path: '', status: '대기' },
  { id: 222, category: '스마트워크', depth1: '', depth2: '보고서', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 223, category: '스마트워크', depth1: '', depth2: '', depth3: '물리력 보고서', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 224, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록', depth5: '', screenName: '물리력 보고서 화면', screenId: 'PM-PUB-0701', path: '', status: '대기' },
  { id: 225, category: '스마트워크', depth1: '', depth2: '', depth3: '기타 영상기기 사용 보고서', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 226, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록', depth5: '', screenName: '기타 영상기기 사용 보고서 화면', screenId: 'PM-PUB-0702', path: '', status: '대기' },
  { id: 227, category: '스마트워크', depth1: '탄력순찰', depth2: '', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 228, category: '스마트워크', depth1: '', depth2: '요청관리', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 229, category: '스마트워크', depth1: '', depth2: '', depth3: '목록', depth4: '', depth5: '', screenName: '요청관리', screenId: 'PM-FLP-0101', path: '', status: '대기' },
  { id: 230, category: '스마트워크', depth1: '', depth2: '범죄 안전 지도', depth3: '탄력순찰상세', depth4: '', depth5: '', screenName: '탄력순찰상세', screenId: 'PM-FLP-0201', path: '', status: '대기' },
  { id: 231, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '종결처리', depth5: '', screenName: '종결처리', screenId: 'PM-FLP-0214', path: '', status: '대기' },
  { id: 232, category: '스마트워크', depth1: '', depth2: '', depth3: '신고현황', depth4: '', depth5: '', screenName: '신고현황 검색', screenId: 'PM-FLP-0202', path: '', status: '대기' },
  { id: 233, category: '스마트워크', depth1: '', depth2: '', depth3: '신고다발지', depth4: '', depth5: '', screenName: '신고다발지 검색', screenId: 'PM-FLP-0203', path: '', status: '대기' },
  { id: 234, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '사건종별 설정', depth5: '', screenName: '사건종별 설정', screenId: 'PM-FLP-0204', path: '', status: '대기' },
  { id: 235, category: '스마트워크', depth1: '', depth2: '', depth3: '탄력순찰등록', depth4: '', depth5: '', screenName: '탄력순찰등록', screenId: 'PM-FLP-0205', path: '', status: '대기' },
  { id: 236, category: '스마트워크', depth1: '', depth2: '', depth3: '요청목록', depth4: '', depth5: '', screenName: '요청목록', screenId: 'PM-FLP-0206', path: '', status: '대기' },
  { id: 237, category: '스마트워크', depth1: '', depth2: '', depth3: '성범죄', depth4: '', depth5: '', screenName: '성범죄 검색', screenId: 'PM-FLP-0207', path: '', status: '대기' },
  { id: 238, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '상세정보', depth5: '', screenName: '상세정보', screenId: 'PM-FLP-0208', path: '', status: '대기' },
  { id: 239, category: '스마트워크', depth1: '', depth2: '', depth3: '전자발찌', depth4: '', depth5: '', screenName: '전자발찌 검색', screenId: 'PM-FLP-0209', path: '', status: '대기' },
  { id: 240, category: '스마트워크', depth1: '', depth2: '', depth3: '정신질환', depth4: '', depth5: '', screenName: '정신질환 검색', screenId: 'PM-FLP-0210', path: '', status: '대기' },
  { id: 241, category: '스마트워크', depth1: '', depth2: '', depth3: '순찰노선', depth4: '', depth5: '', screenName: '순찰노선 검색', screenId: 'PM-FLP-0211', path: '', status: '대기' },
  { id: 242, category: '스마트워크', depth1: '', depth2: '', depth3: '화면분할', depth4: '', depth5: '', screenName: '화면분할', screenId: 'PM-FLP-0212', path: '', status: '대기' },
  { id: 243, category: '스마트워크', depth1: '', depth2: '', depth3: '우범지역', depth4: '', depth5: '', screenName: '우범지역', screenId: 'PM-FLP-0213', path: '', status: '대기' },
  { id: 244, category: '스마트워크', depth1: '', depth2: '', depth3: '관서경계', depth4: '', depth5: '', screenName: '관서경계', screenId: 'PM-FLP-0215', path: '', status: '대기' },
  { id: 245, category: '스마트워크', depth1: '', depth2: '', depth3: 'POI조회', depth4: '', depth5: '', screenName: 'POI조회', screenId: 'PM-FLP-0216', path: '', status: '대기' },
  { id: 246, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '상세정보', depth5: '', screenName: '상세정보', screenId: 'PM-FLP-0217', path: '', status: '대기' },
  { id: 247, category: '', depth1: '', depth2: '', depth3: '항공사진', depth4: '', depth5: '', screenName: '항공사진', screenId: 'PM-FLP-0218', path: '', status: '대기' },
  { id: 248, category: '스마트워크', depth1: '', depth2: '탄력순찰 이행현황', depth3: '', depth4: '', depth5: '', screenName: '탄력순찰 이행현황', screenId: 'PM-FLP-0301', path: '', status: '대기' },
  { id: 249, category: '스마트워크', depth1: '', depth2: '탄력순찰 이행실적', depth3: '', depth4: '', depth5: '', screenName: '탄력순찰 이행실적', screenId: 'PM-FLP-0401', path: '', status: '대기' },
  { id: 250, category: '스마트워크', depth1: '사건대응 시나리오', depth2: '', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 251, category: '스마트워크', depth1: '', depth2: '검색', depth3: '', depth4: '', depth5: '', screenName: '사건대응 시나리오 검색화면', screenId: 'PM-IRC-0101', path: '', status: '대기' },
  { id: 252, category: '스마트워크', depth1: '', depth2: '', depth3: '음성인식 진행중', depth4: '', depth5: '', screenName: '음성인식 진행중 팝업(통합검색 공통)', screenId: 'PM-IRC-0102', path: '', status: '대기' },
  { id: 253, category: '스마트워크', depth1: '', depth2: '', depth3: '음성인식 결과', depth4: '', depth5: '', screenName: '음성인식 결과 팝업(통합검색 공통)', screenId: 'PM-IRC-0103', path: '', status: '대기' },
  { id: 254, category: '스마트워크', depth1: '', depth2: '검색결과', depth3: '', depth4: '', depth5: '', screenName: '사건대응 시나리오 결과화면', screenId: 'PM-IRC-0104', path: '', status: '대기' },
  { id: 255, category: '스마트워크', depth1: '통계', depth2: '', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 256, category: '스마트워크', depth1: '', depth2: '112통계 바로가기', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 257, category: '스마트워크', depth1: '', depth2: '기초통계', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 258, category: '스마트워크', depth1: '', depth2: '', depth3: '관서별현황', depth4: '', depth5: '', screenName: '관서별현황', screenId: 'PC-STT-0101', path: '', status: '대기' },
  { id: 259, category: '스마트워크', depth1: '', depth2: '', depth3: '치안센터현황', depth4: '', depth5: '', screenName: '치안센터현황', screenId: 'PC-STT-0102', path: '', status: '대기' },
  { id: 260, category: '스마트워크', depth1: '', depth2: '', depth3: '인사관리현황', depth4: '', depth5: '', screenName: '인사관리현황', screenId: 'PC-STT-0103', path: '/views/STT/PC-STT-0103', status: '대기' },
  { id: 261, category: '스마트워크', depth1: '', depth2: '', depth3: '물리력사용현황', depth4: '', depth5: '', screenName: '물리력사용현황', screenId: 'PC-STT-0104', path: '', status: '대기' },
  { id: 262, category: '스마트워크', depth1: '', depth2: '', depth3: '장비현황', depth4: '', depth5: '', screenName: '장비현황', screenId: 'PC-STT-0105', path: '', status: '대기' },
  { id: 263, category: '스마트워크', depth1: '', depth2: '', depth3: '근무현황', depth4: '', depth5: '', screenName: '근무현황', screenId: 'PC-STT-0106', path: '', status: '대기' },
  { id: 264, category: '스마트워크', depth1: '', depth2: '근무현황', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 265, category: '스마트워크', depth1: '', depth2: '', depth3: '출동수당현황', depth4: '', depth5: '', screenName: '출동수당현황', screenId: 'PC-STT-0201', path: '', status: '대기' },
  { id: 266, category: '스마트워크', depth1: '', depth2: '', depth3: '탄력순찰실적(개인)', depth4: '', depth5: '', screenName: '탄력순찰실적(개인)', screenId: 'PC-STT-0202', path: '', status: '대기' },
  { id: 267, category: '스마트워크', depth1: '', depth2: '', depth3: 'TCS단속실적현황', depth4: '', depth5: '', screenName: 'TCS단속실적현황', screenId: 'PC-STT-0203', path: '', status: '대기' },
  { id: 268, category: '스마트워크', depth1: '', depth2: '', depth3: '즉결심판실적현황', depth4: '', depth5: '', screenName: '즉결심판실적현황', screenId: 'PC-STT-0204', path: '', status: '대기' },
  { id: 269, category: '스마트워크', depth1: '', depth2: '', depth3: '통고처분실적현황', depth4: '', depth5: '', screenName: '통고처분실적현황', screenId: 'PC-STT-0205', path: '', status: '대기' },
  { id: 270, category: '스마트워크', depth1: '', depth2: '', depth3: '112신고종결현황', depth4: '', depth5: '', screenName: '112신고종결현황', screenId: 'PC-STT-0206', path: '', status: '대기' },
  { id: 271, category: '스마트워크', depth1: '', depth2: '', depth3: '범죄예방진단현황', depth4: '', depth5: '', screenName: '범죄예방진단현황', screenId: 'PC-STT-0207', path: '', status: '대기' },
  { id: 272, category: '스마트워크', depth1: '', depth2: '', depth3: '개인실적현황', depth4: '', depth5: '', screenName: '개인실적현황', screenId: 'PC-STT-0208', path: '', status: '대기' },
  { id: 273, category: '스마트워크', depth1: '', depth2: '바인더통계', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 274, category: '스마트워크', depth1: '', depth2: '', depth3: '지역관서현황', depth4: '', depth5: '', screenName: '지역관서현황', screenId: 'PC-STT-0301', path: '', status: '대기' },
  { id: 275, category: '스마트워크', depth1: '', depth2: '', depth3: '배치인원별', depth4: '', depth5: '', screenName: '배치인원별', screenId: 'PC-STT-0302', path: '', status: '대기' },
  { id: 276, category: '스마트워크', depth1: '', depth2: '', depth3: '관할인구', depth4: '', depth5: '', screenName: '관할인구', screenId: 'PC-STT-0303', path: '', status: '대기' },
  { id: 277, category: '스마트워크', depth1: '', depth2: '', depth3: '정현원', depth4: '', depth5: '', screenName: '정현원', screenId: 'PC-STT-0304', path: '', status: '대기' },
  { id: 278, category: '스마트워크', depth1: '', depth2: '', depth3: '연령별', depth4: '', depth5: '', screenName: '연령별', screenId: 'PC-STT-0305', path: '', status: '대기' },
  { id: 279, category: '스마트워크', depth1: '', depth2: '', depth3: '계급별', depth4: '', depth5: '', screenName: '계급별', screenId: 'PC-STT-0306', path: '', status: '대기' },
  { id: 280, category: '스마트워크', depth1: '', depth2: '', depth3: '1인당 담당인구', depth4: '', depth5: '', screenName: '1인당 담당인구', screenId: 'PC-STT-0307', path: '', status: '대기' },
  { id: 281, category: '스마트워크', depth1: '', depth2: '', depth3: '지역경찰 장비', depth4: '', depth5: '', screenName: '지역경찰 장비', screenId: 'PC-STT-0308', path: '', status: '대기' },
  { id: 282, category: '스마트워크', depth1: '', depth2: '', depth3: '근무체계', depth4: '', depth5: '', screenName: '근무체계', screenId: 'PC-STT-0309', path: '', status: '대기' },
  { id: 283, category: '스마트워크', depth1: '', depth2: '', depth3: '112 출동건수', depth4: '', depth5: '', screenName: '112 출동건수', screenId: 'PC-STT-0310', path: '', status: '대기' },
  { id: 284, category: '스마트워크', depth1: '', depth2: '사용이력통계', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 285, category: '스마트워크', depth1: '', depth2: '', depth3: '메뉴사용통계', depth4: '', depth5: '', screenName: '메뉴별 사용통계홤녀', screenId: 'PC-STT-0401', path: '', status: '대기' },
  { id: 286, category: '스마트워크', depth1: '', depth2: '', depth3: '접속이력조회', depth4: '', depth5: '', screenName: '접속이력조회 화면', screenId: 'PC-STT-0501', path: '', status: '대기' },
  { id: 287, category: '스마트워크', depth1: '', depth2: '', depth3: '중요정보 변경이력 조회', depth4: '', depth5: '', screenName: '중요정보 변경이력 조회 화면', screenId: 'PC-STT-0601', path: '', status: '대기' },
  { id: 288, category: '스마트워크', depth1: '게시판', depth2: '', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 289, category: '스마트워크', depth1: '', depth2: '공지사항', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 290, category: '스마트워크', depth1: '', depth2: '', depth3: '리스트', depth4: '', depth5: '', screenName: '공지사항 리스트 화면', screenId: 'PM-COM-1001', path: '', status: '대기' },
  { id: 291, category: '스마트워크', depth1: '', depth2: '', depth3: '상세내역', depth4: '', depth5: '', screenName: '공지사항 상세내역 화면', screenId: 'PM-COM-1002', path: '', status: '대기' },
  { id: 292, category: '스마트워크', depth1: '', depth2: '', depth3: '수정', depth4: '', depth5: '', screenName: '공지사항 수정 화면', screenId: 'PM-COM-1003', path: '', status: '대기' },
  { id: 293, category: '스마트워크', depth1: '', depth2: '', depth3: '등록', depth4: '', depth5: '', screenName: '공지사항 등록 화면', screenId: 'PM-COM-1004', path: '', status: '대기' },
  { id: 294, category: '스마트워크', depth1: '', depth2: 'Q&A', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 295, category: '스마트워크', depth1: '', depth2: '', depth3: '리스트', depth4: '', depth5: '', screenName: '장애처리 리스트 화면', screenId: 'PM-COM-1101', path: '', status: '대기' },
  { id: 296, category: '스마트워크', depth1: '', depth2: '', depth3: '상세내역', depth4: '', depth5: '', screenName: '장애처리 상세내역 화면', screenId: 'PM-COM-1102', path: '', status: '대기' },
  { id: 297, category: '스마트워크', depth1: '', depth2: '', depth3: '수정', depth4: '', depth5: '', screenName: '수정 화면', screenId: 'PM-COM-1103', path: '', status: '대기' },
  { id: 298, category: '스마트워크', depth1: '', depth2: '', depth3: '등록', depth4: '', depth5: '', screenName: '등록 화면', screenId: 'PM-COM-1104', path: '', status: '대기' },
  { id: 299, category: '스마트워크', depth1: '', depth2: '지역경찰 시책 우수사례', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 300, category: '스마트워크', depth1: '', depth2: '', depth3: '리스트', depth4: '', depth5: '', screenName: '지역경찰 시책 우수사례 리스트 화면', screenId: 'PM-COM-1201', path: '', status: '대기' },
  { id: 301, category: '스마트워크', depth1: '', depth2: '', depth3: '상세내역', depth4: '', depth5: '', screenName: '지역경찰 시책 우수사례 상세내역 화면', screenId: 'PM-COM-1202', path: '', status: '대기' },
  { id: 302, category: '스마트워크', depth1: '', depth2: '', depth3: '수정', depth4: '', depth5: '', screenName: '지역경찰 시책 우수사례 수정화면', screenId: 'PM-COM-1203', path: '', status: '대기' },
  { id: 303, category: '스마트워크', depth1: '', depth2: '', depth3: '등록', depth4: '', depth5: '', screenName: '지역경찰 시책 우수사례 등록 화면', screenId: 'PM-COM-1204', path: '', status: '대기' },
  { id: 304, category: '스마트워크', depth1: '', depth2: '현장조치 우수사례', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 305, category: '스마트워크', depth1: '', depth2: '', depth3: '리스트', depth4: '', depth5: '', screenName: '현장조치 우수사례 리스트화면', screenId: 'PM-COM-1301', path: '', status: '대기' },
  { id: 306, category: '스마트워크', depth1: '', depth2: '', depth3: '상세내역', depth4: '', depth5: '', screenName: '현장조치 우수사례 상세내역 화면', screenId: 'PM-COM-1302', path: '', status: '대기' },
  { id: 307, category: '스마트워크', depth1: '', depth2: '', depth3: '수정', depth4: '', depth5: '', screenName: '현장조치 우수사례 수정화면', screenId: 'PM-COM-1303', path: '', status: '대기' },
  { id: 308, category: '스마트워크', depth1: '', depth2: '', depth3: '등록', depth4: '', depth5: '', screenName: '현장조치 우수사례 등록화면', screenId: 'PM-COM-1304', path: '', status: '대기' },
  { id: 309, category: '스마트워크', depth1: '', depth2: '교육자료 나눔터', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 310, category: '스마트워크', depth1: '', depth2: '', depth3: '교육훈련 우수사례', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 311, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '리스트', depth5: '', screenName: '교육훈련 우수사례 리스트화면', screenId: 'PM-COM-1401', path: '', status: '대기' },
  { id: 312, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '상세내역', depth5: '', screenName: '교육훈련 우수사례 상세내역 화면', screenId: 'PM-COM-1402', path: '', status: '대기' },
  { id: 313, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '수정', depth5: '', screenName: '수정 화면', screenId: 'PM-COM-1403', path: '', status: '대기' },
  { id: 314, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '등록', depth5: '', screenName: '교육훈련 우수사례 등록화면', screenId: 'PM-COM-1404', path: '', status: '대기' },
  { id: 315, category: '스마트워크', depth1: '', depth2: '', depth3: '상시학습자료', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 316, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '리스트', depth5: '', screenName: '상시학습자료 리스트 화면', screenId: 'PM-COM-1501', path: '', status: '대기' },
  { id: 317, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '상세내역', depth5: '', screenName: '상시학습자료 상세내역 화면', screenId: 'PM-COM-1502', path: '', status: '대기' },
  { id: 318, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '수정', depth5: '', screenName: '수정 화면', screenId: 'PM-COM-1503', path: '', status: '대기' },
  { id: 319, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '등록', depth5: '', screenName: '상시학습자료 등록 화면', screenId: 'PM-COM-1504', path: '', status: '대기' },
  { id: 320, category: '스마트워크', depth1: '', depth2: '', depth3: '법령〮지침〮매뉴얼', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 321, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '리스트', depth5: '', screenName: '법령〮지침〮매뉴얼 리스트 화면', screenId: 'PM-COM-1601', path: '', status: '대기' },
  { id: 322, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '상세내역', depth5: '', screenName: '법령〮지침〮매뉴얼 상세내역 화면', screenId: 'PM-COM-1602', path: '', status: '대기' },
  { id: 323, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '수정', depth5: '', screenName: '수정 화면', screenId: 'PM-COM-1603', path: '', status: '대기' },
  { id: 324, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '등록', depth5: '', screenName: '법령〮지침〮매뉴얼 등록화면', screenId: 'PM-COM-1604', path: '', status: '대기' },
  { id: 325, category: '스마트워크', depth1: '', depth2: '', depth3: '현장대응팁', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 326, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '리스트', depth5: '', screenName: '현장대응팁 리스트 화면', screenId: 'PM-COM-1701', path: '', status: '대기' },
  { id: 327, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '상세내역', depth5: '', screenName: '현장대응팁 상세내역 화면', screenId: 'PM-COM-1702', path: '', status: '대기' },
  { id: 328, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '수정', depth5: '', screenName: '수정 화면', screenId: 'PM-COM-1703', path: '', status: '대기' },
  { id: 329, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '등록', depth5: '', screenName: '현장대응팁 등록 화면', screenId: 'PM-COM-1704', path: '', status: '대기' },
  { id: 330, category: '스마트워크', depth1: '', depth2: '자료실', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 331, category: '스마트워크', depth1: '', depth2: '', depth3: '범죄예방진단', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 332, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '리스트', depth5: '', screenName: '범죄예방진단 리스트 화면', screenId: 'PM-COM-1901', path: '', status: '대기' },
  { id: 333, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '상세내역', depth5: '', screenName: '범죄예방진단 상세내역 화면', screenId: 'PM-COM-1902', path: '', status: '대기' },
  { id: 334, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '수정', depth5: '', screenName: '수정 화면', screenId: 'PM-COM-1903', path: '', status: '대기' },
  { id: 335, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '등록', depth5: '', screenName: '범죄예방진단 등록 화면', screenId: 'PM-COM-1904', path: '', status: '대기' },
  { id: 336, category: '스마트워크', depth1: '', depth2: '현장공감 TalkTalk', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 337, category: '스마트워크', depth1: '', depth2: '', depth3: '경찰청 주요 정책', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 338, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '리스트', depth5: '', screenName: '경찰청 주요 정책 리스트 화면', screenId: 'PM-COM-2001', path: '', status: '대기' },
  { id: 339, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '상세내역', depth5: '', screenName: '경찰청 주요 정책 상세내역 화면', screenId: 'PM-COM-2002', path: '', status: '대기' },
  { id: 340, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '수정', depth5: '', screenName: '수정 화면', screenId: 'PM-COM-2003', path: '', status: '대기' },
  { id: 341, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '등록', depth5: '', screenName: '경찰청 주요 정책 등록 화면', screenId: 'PM-COM-2004', path: '', status: '대기' },
  { id: 342, category: '스마트워크', depth1: '', depth2: '', depth3: '정책 제안 및 건의사항', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 343, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '리스트', depth5: '', screenName: '정책 제안 및 건의사항 리스트 화면', screenId: 'PM-COM-2101', path: '', status: '대기' },
  { id: 344, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '상세내역', depth5: '', screenName: '정책 제안 및 건의사항 상세내역 화면', screenId: 'PM-COM-2102', path: '', status: '대기' },
  { id: 345, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '수정', depth5: '', screenName: '수정 화면', screenId: 'PM-COM-2103', path: '', status: '대기' },
  { id: 346, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '등록', depth5: '', screenName: '정책 제안 및 건의사항 등록화면', screenId: 'PM-COM-2104', path: '', status: '대기' },
  { id: 347, category: '스마트워크', depth1: '시스템 관리', depth2: '', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 348, category: '스마트워크', depth1: '', depth2: '시스템 운영관리', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 349, category: '스마트워크', depth1: '', depth2: '', depth3: '사용자 권한관리', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 350, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '상세내역', depth5: '', screenName: '사용자 권한관리 상세화면', screenId: 'PC-COM-2201', path: '/views/com/PC-COM-2201', status: '완료' },
  { id: 351, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '', depth5: '사용자정보 팝업창', screenName: '사용자 정보 상세 팝업창', screenId: 'PC-COM-2202', path: '', status: '대기' },
  { id: 352, category: '스마트워크', depth1: '', depth2: '', depth3: '메뉴관리', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 353, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '상세내역', depth5: '', screenName: '메뉴관리 화면', screenId: 'PC-COM-2203', path: '', status: '대기' },
  { id: 354, category: '스마트워크', depth1: '', depth2: '', depth3: '권한관리', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 355, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '상세내역', depth5: '', screenName: '권한관리 화면', screenId: 'PC-COM-2204', path: '', status: '대기' },
  { id: 356, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '부서 조회', depth5: '', screenName: '부서조회 팝업창', screenId: 'PC-COM-2205', path: '', status: '대기' },
  { id: 357, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '전체 사용자', depth5: '', screenName: '권한이 부여된 사용자 전체 사용자 팝업창', screenId: 'PC-COM-2207', path: '', status: '대기' },
  { id: 358, category: '스마트워크', depth1: '', depth2: '', depth3: '코드관리', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 359, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '상세내역', depth5: '', screenName: '코드관리 화면', screenId: 'PC-COM-2206', path: '', status: '대기' },
  { id: 360, category: '스마트워크', depth1: '', depth2: '시스템 모니터링', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 361, category: '스마트워크', depth1: '', depth2: '', depth3: 'ETL 작업조회', depth4: '', depth5: '', screenName: 'ETL 작업조회', screenId: 'PC-COM-2701', path: '', status: '대기' },
  { id: 362, category: '스마트워크', depth1: '', depth2: '시스템 모니터링 관리', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 363, category: '스마트워크', depth1: '', depth2: '', depth3: '중요정보 변경이력관리', depth4: '', depth5: '', screenName: '중요정보 변경 이력관리', screenId: 'PC-COM-2301', path: '/views/com/PC-COM-2301', status: '대기' },
  { id: 364, category: '스마트워크', depth1: '', depth2: '홈페이지 관리', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 365, category: '스마트워크', depth1: '', depth2: '', depth3: '게시판관리', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 366, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록', depth5: '', screenName: '게시판관리 화면', screenId: 'PC-COM-2401', path: '/views/com/PC-COM-2401', status: '대기' },
  { id: 367, category: '스마트워크', depth1: '', depth2: '', depth3: '팝업 관리', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 368, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '목록', depth5: '', screenName: '팝업관리 화면', screenId: 'PC-COM-2402', path: '', status: '대기' },
  { id: 369, category: '스마트워크', depth1: '', depth2: '', depth3: '', depth4: '등록', depth5: '', screenName: '팝업관리 등록화면', screenId: 'PC-COM-2403', path: '', status: '대기' },
  { id: 370, category: '스마트워크', depth1: '', depth2: '앱관리', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 371, category: '스마트워크', depth1: '', depth2: '', depth3: '목록', depth4: '', depth5: '', screenName: '앱관리 목록 화면', screenId: 'PC-COM-2501', path: '', status: '대기' },
  { id: 372, category: '스마트워크', depth1: '', depth2: '', depth3: '등록', depth4: '', depth5: '', screenName: '앱관리 등록 팝업창', screenId: 'PC-COM-2502', path: '', status: '대기' },
  { id: 373, category: '스마트워크', depth1: '', depth2: '도움말 관리기능', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 374, category: '스마트워크', depth1: '', depth2: '', depth3: '목록', depth4: '', depth5: '', screenName: '도움말 목록 화면', screenId: 'PC-COM-2601', path: '', status: '대기' },
  { id: 375, category: '스마트워크', depth1: '', depth2: '', depth3: '등록', depth4: '', depth5: '', screenName: '도움말 등록 화면', screenId: 'PC-COM-2602', path: '', status: '대기' },
  { id: 376, category: '스마트워크', depth1: '공통', depth2: '', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 377, category: '스마트워크', depth1: '', depth2: '앱 업데이트 화면', depth3: '', depth4: '', depth5: '', screenName: '앱업데이트 안내화면', screenId: 'MO-COM-0103', path: '', status: '대기' },
  { id: 378, category: '스마트워크', depth1: '', depth2: '로그인', depth3: '', depth4: '', depth5: '', screenName: '로그인 화면', screenId: 'PM-COM-0101', path: '', status: '대기' },
  { id: 379, category: '스마트워크', depth1: '', depth2: '', depth3: '공인인증서 등록 팝업', depth4: '', depth5: '', screenName: '공인인증서 등록 팝업', screenId: 'PM-COM-0102', path: '', status: '대기' },
  { id: 380, category: '스마트워크', depth1: '', depth2: '메인', depth3: '', depth4: '', depth5: '', screenName: '메인화면', screenId: 'PM-COM-0201', path: '', status: '대기' },
  { id: 381, category: '스마트워크', depth1: '', depth2: '', depth3: '프로필_알림', depth4: '', depth5: '', screenName: '프로필_알림', screenId: 'PM-COM-0202', path: '', status: '대기' },
  { id: 382, category: '스마트워크', depth1: '', depth2: '', depth3: '프로필_ 보고서 승인 현황', depth4: '', depth5: '', screenName: '프로필_ 보고서 승인 현황', screenId: 'PM-COM-0203', path: '', status: '대기' },
  { id: 383, category: '스마트워크', depth1: '', depth2: '에러페이지', depth3: '', depth4: '', depth5: '', screenName: '에러페이지 화면', screenId: 'PM-COM-0301', path: '', status: '대기' },
  { id: 384, category: '스마트워크', depth1: '', depth2: '주소검색', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 385, category: '스마트워크', depth1: '', depth2: '', depth3: '도로명 찾기', depth4: '', depth5: '', screenName: '도로명 찾기 탭', screenId: 'PC-COM-0401', path: '', status: '대기' },
  { id: 386, category: '스마트워크', depth1: '', depth2: '', depth3: '법정동 찾기', depth4: '', depth5: '', screenName: '법정동 찾기 탭', screenId: 'PC-COM-0402', path: '', status: '대기' },
  { id: 387, category: '스마트워크', depth1: '', depth2: '', depth3: 'GIS 찾기', depth4: '', depth5: '', screenName: 'GIS 찾기 탭', screenId: 'PC-COM-0403', path: '', status: '대기' },
  { id: 388, category: '스마트워크', depth1: '', depth2: '사용자찾기', depth3: '', depth4: '', depth5: '', screenName: '사용자찾기 팝업창', screenId: 'PC-COM-0501', path: '', status: '대기' },
  { id: 389, category: '스마트워크', depth1: '', depth2: '부서검색', depth3: '', depth4: '', depth5: '', screenName: '부서검색 팝업창', screenId: 'PC-COM-0601', path: '', status: '대기' },
  { id: 390, category: '스마트워크', depth1: '', depth2: '통합검색', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' },
  { id: 391, category: '스마트워크', depth1: '', depth2: '', depth3: '검색창', depth4: '', depth5: '', screenName: '통합검색창 화면', screenId: 'PM-COM-0801', path: '', status: '대기' },
  { id: 392, category: '스마트워크', depth1: '', depth2: '', depth3: '검색결과', depth4: '', depth5: '', screenName: '통합검색 결과 화면', screenId: 'PM-COM-0802', path: '', status: '대기' },
  { id: 393, category: '스마트워크', depth1: '', depth2: '로그아웃', depth3: '', depth4: '', depth5: '', screenName: '', screenId: '', path: '', status: '대기' }
])

// 1Depth 필터 목록
const categories = computed(() => {
  return [...new Set(worklist.value.map(item => item.depth1).filter(Boolean))]
})

// 검색 및 필터링 로직 (상위/하위 Depth 및 화면명, 화면ID 전체 검색)
const filteredList = computed(() => {
  return worklist.value.filter(item => {
    const matchCat = !selectedCategory.value || item.depth1 === selectedCategory.value
    const matchStat = !selectedStatus.value || item.status === selectedStatus.value
    const keyword = searchKeyword.value.toLowerCase().trim()
    
    const matchSearch = !keyword || 
      (item.screenName && item.screenName.toLowerCase().includes(keyword)) ||
      (item.screenId && item.screenId.toLowerCase().includes(keyword)) ||
      (item.depth1 && item.depth1.toLowerCase().includes(keyword)) ||
      (item.depth2 && item.depth2.toLowerCase().includes(keyword)) ||
      (item.depth3 && item.depth3.toLowerCase().includes(keyword)) ||
      (item.depth4 && item.depth4.toLowerCase().includes(keyword)) ||
      (item.depth5 && item.depth5.toLowerCase().includes(keyword))

    return matchCat && matchStat && matchSearch
  })
})

const countByStatus = (status) => {
  return worklist.value.filter(item => item.status === status).length
}

const progressRate = computed(() => {
  if (worklist.value.length === 0) return 0
  const completed = countByStatus('완료')
  return Math.round((completed / worklist.value.length) * 100)
})

const goToPage = (path) => {
  if (path) window.open(path, '_blank')
}
</script>

<style scoped>
.worklist-container {
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #333;
}

.worklist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #222;
  padding-bottom: 12px;
}

.worklist-header h2 {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
}

.summary-box span {
  margin-left: 16px;
  font-size: 14px;
}

.summary-box strong {
  color: #1976d2;
}

.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.filter-group label {
  font-size: 13px;
  margin-right: 6px;
}

.filter-group select,
.search-group input {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 13px;
  margin-right: 12px;
}

.search-group button {
  padding: 6px 12px;
  border: 1px solid #bbb;
  background: #fff;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}

.table-wrapper {
  overflow-x: auto;
}

.worklist-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.worklist-table th,
.worklist-table td {
  border: 1px solid #e0e0e0;
  padding: 8px 10px;
}

.worklist-table th {
  background-color: #f1f3f5;
  font-weight: 600;
  text-align: center;
}

.worklist-table tbody tr.has-path {
  background-color: #FFDEAD20;
}

.worklist-table tbody tr:hover {
  background-color: #e8eaee;
}

.text-center { text-align: center; }
.font-bold { font-weight: 600; }
.font-code { font-family: monospace; font-size: 12px; color: #d32f2f; font-weight: 600; }

.status-대기 { color: #888; }
.status-진행중 { color: #ff9800; font-weight: bold; }
.status-검수 { color: #9c27b0; font-weight: bold; }
.status-완료 { color: #2e7d32; font-weight: bold; }

.btn-preview {
  padding: 4px 10px;
  font-size: 12px;
  border: 1px solid #1976d2;
  background: #fff;
  color: #1976d2;
  border-radius: 4px;
  cursor: pointer;
}

.btn-preview:disabled {
  border-color: #ccc;
  color: #ccc;
  cursor: not-allowed;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #888;
}
</style>